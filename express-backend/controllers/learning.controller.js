const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");
const LearningContent = require("../models/LearningContent");
const ChatFeedback = require("../models/ChatFeedback");
const User = require("../models/User");
const { FASTAPI_URL } = require("../const");

function userSafeAiMessage(message, status) {
  const detail = String(message || "");
  if (status === 429 || /resource_exhausted|quota|rate.?limit/i.test(detail)) {
    return "The AI learning service is temporarily busy. Please wait a minute and try again.";
  }
  if (/gemini|model|generate learning material/i.test(detail)) {
    return "The AI learning service is temporarily unavailable. Please try again shortly.";
  }
  return "The learning request could not be completed. Please try again.";
}

async function fastApi(path, options) {
  try {
    const response = await axios({
      url: `${FASTAPI_URL}${path}`,
      method: options.method || "GET",
      headers: options.headers || {},
      data: options.body
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const providerMessage = error.response.data?.detail || error.response.data?.message;
      const err = new Error(userSafeAiMessage(providerMessage, error.response.status));
      err.status = error.response.status;
      throw err;
    }
    throw new Error("Invalid response from the AI service.");
  }
}

async function createTranscript(req, res, next) {
  try {
    let result;
    let title;
    let language;
    if (req.file) {
      language = req.body.language || "en-US";
      title = req.body.title?.trim() || req.file.originalname.replace(/\.[^.]+$/, "");
      const form = new FormData();
      form.append("file", fs.createReadStream(req.file.path), req.file.originalname);
      form.append("translate_to_english", String(req.body.translate === "on"));
      result = await fastApi("/transcript", { 
        method: "POST", 
        headers: form.getHeaders(),
        body: form 
      });
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
      });
    } else {
      const { youtubeUrl, language: inputLanguage = "en", translateToEnglish = false, title: requestedTitle } = req.body;
      if (!youtubeUrl) return res.status(400).json({ message: "Upload a file or provide a YouTube URL." });
      title = requestedTitle?.trim() || "YouTube lesson";
      language = inputLanguage;
      result = await fastApi("/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: youtubeUrl, language, translate_to_english: translateToEnglish }),
      });
    }
    const content = await LearningContent.create({
      user: req.userId,
      fastApiContentId: result.content_id,
      sourceType: result.source_type,
      title,
      language: result.language || language,
      transcript: result.original_transcript,
      englishTranslation: result.english_translation,
    });
    return res.status(201).json({ content: toClientContent(content) });
  } catch (error) { return next(error); }
}

function toClientContent(content) {
  return {
    id: content.id, title: content.title, sourceType: content.sourceType, language: content.language,
    transcript: content.transcript, englishTranslation: content.englishTranslation, summary: content.summary,
    notes: content.notes, flashcards: content.flashcards,
    quiz: content.quiz, latestAnalysis: content.latestAnalysis, createdAt: content.createdAt,
    chatHistory: content.chatHistory,
  };
}

async function listContent(req, res, next) {
  try {
    const content = await LearningContent.find({ user: req.userId }).sort({ updatedAt: -1 }).limit(50);
    return res.json({ content: content.map(toClientContent) });
  } catch (error) { return next(error); }
}

async function getContent(req, res, next) {
  try {
    const content = await LearningContent.findOne({ _id: req.params.contentId, user: req.userId });
    if (!content) return res.status(404).json({ message: "Learning material not found." });
    return res.json({ content: toClientContent(content) });
  } catch (error) { return next(error); }
}

async function summary(req, res, next) {
  try {
    const content = await LearningContent.findOne({ _id: req.params.contentId, user: req.userId });
    if (!content) return res.status(404).json({ message: "Learning material not found." });
    const result = await fastApi("/summary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content_id: content.fastApiContentId }) });
    content.summary = result.summary;
    await content.save();
    return res.json({ summary: result.summary });
  } catch (error) { return next(error); }
}

async function chat(req, res, next) {
  try {
    const content = await LearningContent.findOne({ _id: req.params.contentId, user: req.userId });
    if (!content) return res.status(404).json({ message: "Learning material not found." });
    
    // Fetch previous negative feedback to improve prompts
    const negativeFeedback = await ChatFeedback.find({ user: req.userId, contentId: content._id, rating: -1 }).sort({ createdAt: -1 }).limit(5);
    const previous_feedback = negativeFeedback.map(f => `Question: ${f.question}\nYour Answer: ${f.answer}`);
    
    const result = await fastApi("/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content_id: content.fastApiContentId, question: req.body.question, previous_feedback }) });
    
    if (!content.chatHistory) content.chatHistory = [];
    content.chatHistory.push({ role: "user", text: req.body.question });
    if (result.answer) {
      content.chatHistory.push({ role: "assistant", text: result.answer, source: result.retrieved_context?.[0] });
      await content.save();
    }
    
    return res.json(result);
  } catch (error) { return next(error); }
}

async function generalChat(req, res, next) {
  try {
    const result = await fastApi("/general_chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: req.body.question }) });
    return res.json(result);
  } catch (error) { return next(error); }
}

async function quiz(req, res, next) {
  try {
    const content = await LearningContent.findOne({ _id: req.params.contentId, user: req.userId });
    if (!content) return res.status(404).json({ message: "Learning material not found." });
    const result = await fastApi("/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content_id: content.fastApiContentId, count: req.body.count || 5 }) });
    content.quiz = { quizId: result.quiz_id, questions: result.questions };
    await content.save();
    return res.json(result);
  } catch (error) { return next(error); }
}

async function notes(req, res, next) {
  try {
    const content = await LearningContent.findOne({ _id: req.params.contentId, user: req.userId });
    if (!content) return res.status(404).json({ message: "Learning material not found." });
    const result = await fastApi("/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content_id: content.fastApiContentId }) });
    content.notes = result.notes;
    await content.save();
    return res.json({ notes: result.notes });
  } catch (error) { return next(error); }
}

async function flashcards(req, res, next) {
  try {
    const content = await LearningContent.findOne({ _id: req.params.contentId, user: req.userId });
    if (!content) return res.status(404).json({ message: "Learning material not found." });
    const result = await fastApi("/flashcards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content_id: content.fastApiContentId, count: req.body.count || 8 }) });
    content.flashcards = result.flashcards;
    await content.save();
    return res.json({ flashcards: result.flashcards });
  } catch (error) { return next(error); }
}

async function evaluate(req, res, next) {
  try {
    const content = await LearningContent.findOne({ _id: req.params.contentId, user: req.userId });
    if (!content?.quiz?.quizId) return res.status(400).json({ message: "Generate a quiz before submitting answers." });
    const result = await fastApi("/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quiz_id: content.quiz.quizId, answers: req.body.answers }) });
    content.latestAnalysis = result;
    await content.save();
    
    // Award points
    await User.findByIdAndUpdate(req.userId, { $inc: { rewardsPoints: 50 } });
    
    return res.json(result);
  } catch (error) { return next(error); }
}

async function deleteContent(req, res, next) {
  try {
    const { contentId } = req.params;
    const content = await LearningContent.findOneAndDelete({ _id: contentId, user: req.userId });
    if (!content) return res.status(404).json({ message: "Content not found." });
    return res.json({ message: "Content deleted successfully." });
  } catch (error) { return next(error); }
}

async function chatFeedback(req, res, next) {
  try {
    const { question, answer, rating } = req.body;
    await ChatFeedback.create({ user: req.userId, contentId: req.params.contentId, question, answer, rating });
    return res.json({ message: "Feedback recorded." });
  } catch (error) { return next(error); }
}

module.exports = { createTranscript, listContent, getContent, summary, chat, generalChat, quiz, notes, flashcards, evaluate, deleteContent, chatFeedback };
