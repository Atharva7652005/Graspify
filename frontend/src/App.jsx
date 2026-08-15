import { useRef, useState } from "react";
import "./App.css";

const Icon = ({ name, size = 20 }) => {
  const p = {
    sparkles: (
      <>
        <path d="m12 3-1.1 4.1L7 8.2l3.9 1.1L12 13.5l1.1-4.2L17 8.2l-3.9-1.1L12 3Z" />
        <path d="m19 14-.6 2.4L16 17l2.4.6L19 20l.6-2.4L22 17l-2.4-.6L19 14Z" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    home: (
      <>
        <path d="m3 10 9-7 9 7v10H3V10Z" />
        <path d="M9 21v-7h6v7" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
        <path d="M4 19a2.5 2.5 0 0 1 2.5-2.5H20" />
      </>
    ),
    message: (
      <path d="M20 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4v8Z" />
    ),
    chart: (
      <>
        <path d="M4 19V5M4 19h17" />
        <path d="m8 15 4-4 3 2 5-6" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.2 2.2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3.2v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.2-2.2.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5v-3.2h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.2-2.2.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V4h3.2v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.2 2.2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4M8 8l4-4 4 4" />
        <path d="M4 14v5h16v-5" />
      </>
    ),
    play: <path d="m9 7 8 5-8 5V7Z" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    send: <path d="m21 3-7.5 18-3.8-7.7L2 9.5 21 3Z" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
        <path d="M14 2v6h6M8 13h8M8 17h5" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 11a8 8 0 1 0 1 4" />
        <path d="M20 4v7h-7" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {p[name]}
    </svg>
  );
};
const concepts = [
  ["Normalization", 90, "strong"],
  ["Indexing", 85, "strong"],
  ["Transactions", 65, "practice"],
  ["SQL Joins", 45, "weak"],
];
const steps = [
  "Upload",
  "Transcription",
  "Translation",
  "AI Summary",
  "Key Concepts",
  "RAG Indexing",
  "Quiz Generation",
  "Ready to Learn",
];
const transcript = [
  [
    "00:00",
    "In this lesson, we will explore how relational databases organize information into meaningful tables.",
  ],
  [
    "00:35",
    "SQL lets us retrieve and manage this data through concise, structured commands.",
  ],
  [
    "03:20",
    "Normalization reduces repeated information and makes database changes more reliable.",
  ],
  ["06:42", "A primary key uniquely identifies every record in a table."],
];

function App() {
  const input = useRef(null);
  const [page, setPage] = useState("Dashboard");
  const [upload, setUpload] = useState("idle");
  const [file, setFile] = useState("");
  const [tab, setTab] = useState("Overview");
  const [transcriptLanguage, setTranscriptLanguage] = useState(
    "English Translation",
  );
  const [chat, setChat] = useState([
    {
      from: "ai",
      text: "Ask anything about Introduction to SQL. I’ll answer using this lesson and show you where it was discussed.",
      source: "Introduction to SQL · 06:42",
    },
  ]);
  const [message, setMessage] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [quizState, setQuizState] = useState("start");
  const [answer, setAnswer] = useState("");
  const chooseFile = (e) => {
    const picked = e.target.files?.[0];
    if (picked) {
      setFile(picked.name);
      setUpload("configure");
    }
  };
  const generate = () => {
    setUpload("processing");
    setTimeout(() => setUpload("ready"), 1700);
  };
  const openLesson = () => {
    setPage("Lesson");
    setTab("Overview");
    window.scrollTo(0, 0);
  };
  const send = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setChat([
      ...chat,
      { from: "user", text: message },
      {
        from: "ai",
        text: "Normalization organizes related data to reduce duplication. In this lesson, the instructor demonstrates it with customer and order tables.",
        source: "Introduction to SQL · 03:20",
      },
    ]);
    setMessage("");
  };
  const nav = [
    ["Dashboard", "home"],
    ["My Learning", "book"],
    ["AI Tutor", "message"],
    ["Insights", "chart"],
  ];
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setPage("Dashboard")}>
          <span className="brand-mark">
            <Icon name="sparkles" size={18} />
          </span>
          Graspify
        </button>
        <div className="workspace">
          <span>WORKSPACE</span>
          <button>
            My Learning <Icon name="chevron" size={14} />
          </button>
        </div>
        <nav>
          {nav.map(([label, icon]) => (
            <button
              key={label}
              className={page === label ? "active" : ""}
              onClick={() =>
                label === "Dashboard"
                  ? setPage("Dashboard")
                  : label === "My Learning"
                    ? setPage("Lesson")
                    : setPage(label)
              }
            >
              <Icon name={icon} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button>
            <Icon name="settings" />
            Settings
          </button>
          <div className="profile">
            <div className="avatar">AK</div>
            <div>
              <strong>Aditya Kumar</strong>
              <span>Free plan</span>
            </div>
            <Icon name="chevron" size={15} />
          </div>
        </div>
      </aside>
      <section className="content">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">
              <Icon name="sparkles" size={16} />
            </span>{" "}
            Graspify
          </div>
          <div className="search">
            <Icon name="search" size={18} />
            <input placeholder="Search your learning materials" />
          </div>
          <button className="icon-button" aria-label="Notifications">
            <Icon name="bell" size={20} />
            <i />
          </button>
        </header>
        {page === "Lesson" || page === "My Learning" ? (
          <Lesson
            tab={tab}
            setTab={setTab}
            transcriptLanguage={transcriptLanguage}
            setTranscriptLanguage={setTranscriptLanguage}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            quizState={quizState}
            setQuizState={setQuizState}
            answer={answer}
            setAnswer={setAnswer}
          />
        ) : (
          <Dashboard
            input={input}
            upload={upload}
            file={file}
            chooseFile={chooseFile}
            generate={generate}
            openLesson={openLesson}
          />
        )}
      </section>
      <Tutor
        chat={chat}
        message={message}
        setMessage={setMessage}
        send={send}
        setPage={setPage}
        setTab={setTab}
      />
    </main>
  );
}
function Dashboard({ input, upload, file, chooseFile, generate, openLesson }) {
  return (
    <div className="page">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">FRIDAY, AUGUST 15</p>
          <h1>
            Good morning, Aditya <span>✦</span>
          </h1>
          <p className="subtext">
            Turn every lesson into knowledge you can truly grasp.
          </p>
        </div>
        <button className="new-lesson" onClick={() => input.current?.click()}>
          <Icon name="plus" size={18} /> Upload lecture
        </button>
        <input
          ref={input}
          type="file"
          accept="audio/*,video/*"
          hidden
          onChange={chooseFile}
        />
      </div>
      <div className="learning-loop">
        <span>
          <b>01</b> Upload
        </span>
        <Icon name="arrow" size={13} />
        <span>
          <b>02</b> AI understands
        </span>
        <Icon name="arrow" size={13} />
        <span>
          <b>03</b> Learn & practice
        </span>
        <Icon name="arrow" size={13} />
        <span>
          <b>04</b> Measure
        </span>
      </div>
      {upload === "idle" && (
        <section className="upload-card enhanced">
          <div className="upload-copy">
            <div className="upload-icon">
              <Icon name="upload" size={22} />
            </div>
            <div>
              <h2>Turn a lecture into an interactive learning experience</h2>
              <p>
                Upload audio or video and Graspify will build structured notes,
                a smart quiz, and an AI tutor grounded in your lesson.
              </p>
              <small>MP4 · MP3 · WAV · M4A · Up to 30 minutes</small>
              <div className="capabilities">
                <span>Multilingual</span>
                <span>AI Summary</span>
                <span>Smart Quiz</span>
                <span>AI Tutor</span>
              </div>
            </div>
          </div>
          <button
            className="upload-button"
            onClick={() => input.current?.click()}
          >
            Choose file <Icon name="arrow" size={17} />
          </button>
        </section>
      )}
      {upload === "configure" && (
        <section className="upload-card configure">
          <div>
            <p className="eyebrow">READY TO CREATE</p>
            <h2>{file}</h2>
            <p>Choose the language settings for this learning lesson.</p>
          </div>
          <div className="selects">
            <label>
              Content language
              <select defaultValue="Auto Detect">
                <option>Auto Detect</option>
                <option>English</option>
                <option>Hindi</option>
                <option>Marathi</option>
              </select>
            </label>
            <label>
              Output language
              <select defaultValue="English">
                <option>English</option>
              </select>
            </label>
            <button className="new-lesson" onClick={generate}>
              Generate learning material <Icon name="arrow" size={16} />
            </button>
          </div>
        </section>
      )}
      {(upload === "processing" || upload === "ready") && (
        <section className="processing">
          <div className="processing-head">
            <div>
              <p className="eyebrow">GRASPIFY AI PIPELINE</p>
              <h2>
                {upload === "ready"
                  ? "Your learning material is ready"
                  : "Creating your learning material"}
              </h2>
              <p>
                {upload === "ready"
                  ? "Everything is prepared for you to explore, practice, and improve."
                  : "We are transforming your lecture into a personalized learning experience."}
              </p>
            </div>
            {upload === "ready" && (
              <button className="new-lesson" onClick={openLesson}>
                Open lesson <Icon name="arrow" size={16} />
              </button>
            )}
          </div>
          <div className="pipeline">
            {steps.map((s, i) => {
              const status =
                upload === "ready" || i < 6
                  ? "done"
                  : i === 6
                    ? "working"
                    : "waiting";
              return (
                <div className={status} key={s}>
                  <span>
                    {status === "done" ? (
                      <Icon name="check" size={14} />
                    ) : status === "working" ? (
                      "…"
                    ) : (
                      i + 1
                    )}
                  </span>
                  <b>{s}</b>
                </div>
              );
            })}
          </div>
        </section>
      )}
      <section className="dashboard-grid">
        <div className="recent-section panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">CONTINUE LEARNING</p>
              <h2>Pick up where you left off</h2>
            </div>
            <button className="text-button">
              View all <Icon name="arrow" size={15} />
            </button>
          </div>
          <button className="feature-lesson" onClick={openLesson}>
            <span className="lesson-art violet">⌘</span>
            <span>
              <strong>Introduction to SQL</strong>
              <small>18 min · English · 72% estimated grasping</small>
              <em>Last activity: Quiz completed today</em>
            </span>
            <i>
              Continue learning <Icon name="arrow" size={15} />
            </i>
          </button>
          <div className="lesson-list">
            {[
              [
                "Cell Biology Fundamentals",
                "24 min · English · Yesterday",
                "⌁",
                "coral",
              ],
              [
                "Linear Algebra: Vectors",
                "31 min · English · Aug 12",
                "∑",
                "mint",
              ],
            ].map(([a, b, c, d]) => (
              <button className="lesson-row" key={a}>
                <span className={"lesson-art " + d}>{c}</span>
                <span className="lesson-info">
                  <strong>{a}</strong>
                  <small>
                    <Icon name="clock" size={13} />
                    {b}
                  </small>
                </span>
                <span className="resume">
                  <Icon name="play" size={15} /> Resume
                </span>
              </button>
            ))}
          </div>
        </div>
        <LearningOverview />
      </section>
      <section className="bottom-grid">
        <Insights />
        <Recommendation openLesson={openLesson} />
      </section>
    </div>
  );
}
function LearningOverview() {
  return (
    <section className="progress-card">
      <div className="progress-title">
        <div>
          <p className="eyebrow">YOUR LEARNING OVERVIEW</p>
          <h2>Learning momentum</h2>
        </div>
        <span className="streak">🔥 4 day streak</span>
      </div>
      <div className="overview-score">
        <strong>
          72<span>%</span>
        </strong>
        <p>
          overall estimated
          <br />
          grasping
        </p>
      </div>
      <div className="overview-stats">
        <span>
          <b>12</b>Lessons completed
        </span>
        <span>
          <b>8</b>Quizzes completed
        </span>
        <span>
          <b>3</b>Topics to revisit
        </span>
      </div>
      <div className="progress-track">
        <i />
      </div>
    </section>
  );
}
function Insights() {
  return (
    <div className="grasp-card panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">AI LEARNING INSIGHTS</p>
          <h2>Estimated grasping level</h2>
        </div>
        <b className="score-chip">72%</b>
      </div>
      <p className="subtext">Based on observable assessment performance.</p>
      <ConceptBars />
    </div>
  );
}
function ConceptBars() {
  return (
    <div className="bars">
      {concepts.map(([topic, score, status]) => (
        <div className="bar-row" key={topic}>
          <span>{topic}</span>
          <div>
            <i className={status} style={{ width: score + "%" }} />
          </div>
          <b>{score}%</b>
        </div>
      ))}
    </div>
  );
}
function Recommendation({ openLesson }) {
  return (
    <div className="recommend-card">
      <span className="recommend-icon">
        <Icon name="sparkles" size={18} />
      </span>
      <div>
        <p className="eyebrow">AI INSIGHT</p>
        <h3>Strengthen your SQL Joins</h3>
        <p>
          SQL Joins appears to be your weakest concept based on your recent
          assessment performance. Revisit Lecture 3 · 18:24–25:40, then practice
          again.
        </p>
        <div className="recommend-actions">
          <button onClick={openLesson}>
            Review topic <Icon name="arrow" size={15} />
          </button>
          <button className="secondary" onClick={openLesson}>
            Take targeted quiz
          </button>
        </div>
      </div>
    </div>
  );
}
function Lesson({
  tab,
  setTab,
  transcriptLanguage,
  setTranscriptLanguage,
  difficulty,
  setDifficulty,
  quizState,
  setQuizState,
  answer,
  setAnswer,
}) {
  let body;
  if (tab === "Transcript")
    body = (
      <Transcript
        language={transcriptLanguage}
        setLanguage={setTranscriptLanguage}
      />
    );
  else if (tab === "Quiz")
    body = (
      <Quiz
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        state={quizState}
        setState={setQuizState}
        answer={answer}
        setAnswer={setAnswer}
      />
    );
  else if (tab === "Grasping") body = <Analysis />;
  else if (tab === "AI Tutor") body = <TutorLesson />;
  else body = <Overview />;
  return (
    <div className="page lesson-page">
      <button className="back-link" onClick={() => history.back()}>
        ← Back to dashboard
      </button>
      <div className="lesson-title">
        <div>
          <p className="eyebrow">LEARNING LESSON</p>
          <h1>Introduction to SQL</h1>
          <p className="subtext">
            18 min · English ·{" "}
            <span className="meta-ready">
              <Icon name="check" size={12} /> Processed
            </span>
          </p>
        </div>
        <button className="outline-button">
          <Icon name="refresh" size={15} /> Regenerate
        </button>
      </div>
      <div className="lesson-tabs">
        {[
          "Overview",
          "Transcript",
          "Key Concepts",
          "Quiz",
          "AI Tutor",
          "Grasping",
        ].map((x) => (
          <button
            key={x}
            className={x === tab ? "selected" : ""}
            onClick={() => setTab(x)}
          >
            {x}
          </button>
        ))}
      </div>
      {body}
    </div>
  );
}
function Overview() {
  return (
    <section className="lesson-workspace">
      <div className="overview-main">
        <p className="eyebrow">AI SUMMARY</p>
        <h2>A practical introduction to relational databases</h2>
        <p>
          SQL is a language used to communicate with relational databases. This
          lesson explains how tables store related data, how primary keys make
          records unique, and why normalization makes systems easier to
          maintain.
        </p>
        <h3>Key concepts</h3>
        <div className="concept-tags">
          {["Normalization", "Transactions", "SQL Joins", "Indexing"].map(
            (x) => (
              <span key={x}>{x}</span>
            ),
          )}
        </div>
        <h3>What you’ll learn</h3>
        <ol>
          <li>Understand relational database structure</li>
          <li>Understand why normalization matters</li>
          <li>Write basic SQL queries with confidence</li>
        </ol>
      </div>
      <div className="quick-assessment">
        <div className="quiz-icon">?</div>
        <p className="eyebrow">QUICK ASSESSMENT</p>
        <h3>Ready to test your understanding?</h3>
        <p>Take a 5-question quiz based only on this lesson.</p>
        <button>
          Start quiz <Icon name="arrow" size={15} />
        </button>
      </div>
    </section>
  );
}
function Transcript({ language, setLanguage }) {
  return (
    <section className="transcript-layout">
      <div className="video-placeholder">
        <button>
          <Icon name="play" size={22} />
        </button>
        <span>Introduction to SQL</span>
        <small>18:03</small>
      </div>
      <div className="transcript-panel">
        <div className="transcript-head">
          <div>
            <h2>Transcript</h2>
            <p>Hindi → English</p>
          </div>
          <div className="language-toggle">
            {["Original · Hindi", "English Translation"].map((x) => (
              <button
                key={x}
                className={x === language ? "selected" : ""}
                onClick={() => setLanguage(x)}
              >
                {x}
              </button>
            ))}
          </div>
        </div>
        {transcript.map(([time, text], i) => (
          <button
            className={"transcript-line " + (i === 2 ? "current" : "")}
            key={time}
          >
            <b>{time}</b>
            <span>
              {language.startsWith("Original") && i === 2
                ? "डेटा की अनावश्यक पुनरावृत्ति को कम करने के लिए नॉर्मलाइज़ेशन का उपयोग किया जाता है।"
                : text}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
function Quiz({
  difficulty,
  setDifficulty,
  state,
  setState,
  answer,
  setAnswer,
}) {
  if (state === "result")
    return (
      <section className="quiz-result">
        <p className="eyebrow">QUIZ RESULTS</p>
        <h2>
          7 <span>/ 10</span>
        </h2>
        <p>
          You have a solid foundation. Here’s what your assessment performance
          suggests.
        </p>
        <ConceptBars />
        <div className="result-insight">
          <strong>Recommended next step</strong>
          <p>
            Review SQL Joins and take a targeted 5-question quiz to reassess
            your understanding.
          </p>
          <button onClick={() => setState("question")}>
            Practice again <Icon name="arrow" size={15} />
          </button>
        </div>
      </section>
    );
  if (state === "question")
    return (
      <section className="quiz-question">
        <div className="quiz-progress">
          <span>Question 2 of 5</span>
          <i>
            <b />
          </i>
        </div>
        <p className="eyebrow">MEDIUM DIFFICULTY</p>
        <h2>What is the primary purpose of database normalization?</h2>
        {[
          "To reduce redundant data and improve consistency",
          "To make tables contain more columns",
          "To replace SQL queries with spreadsheets",
          "To encrypt every database record",
        ].map((x) => (
          <button
            className={answer === x ? "chosen" : ""}
            onClick={() => setAnswer(x)}
            key={x}
          >
            <span /> {x}
          </button>
        ))}
        <div>
          <button className="outline-button" onClick={() => setState("start")}>
            Previous
          </button>
          <button className="new-lesson" onClick={() => setState("result")}>
            Next question <Icon name="arrow" size={15} />
          </button>
        </div>
      </section>
    );
  return (
    <section className="quiz-start">
      <div className="quiz-icon">?</div>
      <p className="eyebrow">KNOWLEDGE CHECK</p>
      <h2>Test your understanding</h2>
      <p>
        This 5-question quiz is generated from Introduction to SQL. Your results
        help create learning insights and recommendations.
      </p>
      <label>Choose difficulty</label>
      <div className="difficulty">
        {["Easy", "Medium", "Hard"].map((x) => (
          <button
            className={difficulty === x ? "selected" : ""}
            onClick={() => setDifficulty(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <button className="new-lesson" onClick={() => setState("question")}>
        Start quiz <Icon name="arrow" size={15} />
      </button>
    </section>
  );
}
function Analysis() {
  return (
    <section className="analysis-page">
      <p className="eyebrow">YOUR LEARNING INSIGHTS</p>
      <h2>
        Overall estimated grasping: <b>72%</b>
      </h2>
      <p className="subtext">
        An estimate based on observable quiz and learning activity—not a measure
        of cognitive ability.
      </p>
      <div className="analysis-grid">
        <div>
          <h3>Concept-level understanding</h3>
          <ConceptBars />
        </div>
        <div className="analysis-note">
          <strong>Needs practice</strong>
          <h3>SQL Joins</h3>
          <p>
            Review the explanation and examples from 18:24–25:40, then take a
            focused assessment.
          </p>
          <button>
            Review topic <Icon name="arrow" size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
function TutorLesson() {
  return (
    <section className="tutor-lesson">
      <div className="tutor-orb">
        <Icon name="sparkles" size={21} />
      </div>
      <p className="eyebrow">ASK GRASPIFY</p>
      <h2>Learn with your lesson, not a generic chatbot.</h2>
      <p>
        Ask for an explanation, example, comparison, source timestamp, or a
        quiz. Answers are grounded in Introduction to SQL.
      </p>
      <div>
        <button>Explain this simply</button>
        <button>Give me an example</button>
        <button>Where was this discussed?</button>
        <button>Quiz me</button>
      </div>
    </section>
  );
}
function Tutor({ chat, message, setMessage, send, setPage, setTab }) {
  return (
    <aside className="tutor-panel">
      <div className="tutor-head">
        <div className="tutor-orb">
          <Icon name="sparkles" size={18} />
        </div>
        <div>
          <h2>Ask Graspify</h2>
          <p>
            <i /> Grounded in this lesson
          </p>
        </div>
        <button aria-label="Close tutor">×</button>
      </div>
      <div className="tutor-context">
        <Icon name="file" size={16} />
        <span>Introduction to SQL</span>
        <button
          onClick={() => {
            setPage("Lesson");
            setTab("Transcript");
          }}
        >
          Open lesson
        </button>
      </div>
      <div className="chat">
        {chat.map((x, i) => (
          <div className={"bubble " + x.from} key={i}>
            <span>{x.from === "ai" && <Icon name="sparkles" size={14} />}</span>
            <div>
              <p>{x.text}</p>
              {x.source && (
                <button
                  className="source"
                  onClick={() => {
                    setPage("Lesson");
                    setTab("Transcript");
                  }}
                >
                  <Icon name="play" size={11} /> Source · {x.source}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="suggestions">
        <p>TRY ASKING</p>
        {[
          "Explain this simply",
          "Give me an example",
          "Where was this discussed?",
          "Quiz me",
        ].map((x) => (
          <button onClick={() => setMessage(x)} key={x}>
            {x}
          </button>
        ))}
      </div>
      <form className="chat-input" onSubmit={send}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about this lesson..."
        />
        <button aria-label="Send message">
          <Icon name="send" size={17} />
        </button>
      </form>
      <p className="ai-note">
        AI can make mistakes. Check important information.
      </p>
    </aside>
  );
}
export default App;
