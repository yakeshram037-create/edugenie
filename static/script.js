// ==========================================
// EDUGENIE - MAIN JAVASCRIPT
// ==========================================


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let questionsAsked = 0;
let quizzesCompleted = 0;
let notesGenerated = 0;

let quizQuestions = [];
let currentQuestion = 0;
let quizScore = 0;
let selectedAnswer = null;

let quizTimer = null;
let quizTimeLeft = 0;


// ==========================================
// LOCAL STORAGE
// ==========================================

function loadProgress() {

    questionsAsked =
        parseInt(
            localStorage.getItem("edugenie_questions") || "0"
        );

    quizzesCompleted =
        parseInt(
            localStorage.getItem("edugenie_quizzes") || "0"
        );

    notesGenerated =
        parseInt(
            localStorage.getItem("edugenie_notes") || "0"
        );

    updateProgress();
}


function saveProgress() {

    localStorage.setItem(
        "edugenie_questions",
        questionsAsked
    );

    localStorage.setItem(
        "edugenie_quizzes",
        quizzesCompleted
    );

    localStorage.setItem(
        "edugenie_notes",
        notesGenerated
    );
}


function updateProgress() {

    updateQuestionCounter();

    const quizCounter =
        document.getElementById("quizCountProgress");

    if (quizCounter) {
        quizCounter.innerText =
            quizzesCompleted;
    }

    const notesCounter =
        document.getElementById("notesCount");

    if (notesCounter) {
        notesCounter.innerText =
            notesGenerated;
    }
}


// ==========================================
// SECTION NAVIGATION
// ==========================================

function showSection(sectionId, button) {

    const sections =
        document.querySelectorAll(".section");

    sections.forEach(section => {
        section.classList.remove("active-section");
    });

    const selectedSection =
        document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.add("active-section");
    }

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
        item.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    updatePageTitle(sectionId);
}


// ==========================================
// SHOW SECTION FROM FEATURE CARD
// ==========================================

function showSectionById(sectionId) {

    const sections =
        document.querySelectorAll(".section");

    sections.forEach(section => {
        section.classList.remove("active-section");
    });

    const selectedSection =
        document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.add("active-section");
    }

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(item => {

        item.classList.remove("active");

        const text =
            item.innerText.toLowerCase();

        if (
            (sectionId === "tutor" &&
                text.includes("ai tutor")) ||

            (sectionId === "notes" &&
                text.includes("study notes")) ||

            (sectionId === "quiz" &&
                text.includes("quiz")) ||

            (sectionId === "flashcards" &&
                text.includes("flashcards")) ||

            (sectionId === "references" &&
                text.includes("references")) ||

            (sectionId === "progress" &&
                text.includes("progress"))
        ) {
            item.classList.add("active");
        }
    });

    updatePageTitle(sectionId);
}


// ==========================================
// PAGE TITLE
// ==========================================

function updatePageTitle(sectionId) {

    const pageTitle =
        document.getElementById("pageTitle");

    if (!pageTitle) {
        return;
    }

    const titles = {

        dashboard: "Dashboard",

        tutor: "AI Tutor",

        notes: "Study Notes",

        quiz: "Quiz Generator",

        flashcards: "Flashcards",

        references: "Learning References",

        progress: "Learning Progress"
    };

    pageTitle.innerText =
        titles[sectionId] || "EduGenie";
}


// ==========================================
// GENERIC AI REQUEST
// ==========================================

async function askAI(
    question,
    answerElement,
    button = null
) {

    if (!question || !question.trim()) {

        answerElement.innerText =
            "⚠️ Please enter a question.";

        answerElement.classList.remove("hidden");

        return;
    }

    answerElement.innerText =
        "🤔 EduGenie is thinking...";

    answerElement.classList.remove("hidden");

    if (button) {

        button.disabled = true;

        button.dataset.oldText =
            button.innerText;

        button.innerText =
            "Thinking...";
    }

    try {

        const response =
            await fetch("/ask", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    question: question
                })
            });

        const data =
            await response.json();


        if (response.ok && data.answer) {

            answerElement.innerText =
                data.answer;

            questionsAsked++;

            saveProgress();

            updateProgress();

        } else {

            answerElement.innerText =
                "❌ " +
                (
                    data.error ||
                    "Something went wrong."
                );
        }

    } catch (error) {

        console.error(
            "EduGenie error:",
            error
        );

        answerElement.innerText =
            "❌ Unable to connect to EduGenie. " +
            "Make sure the Flask server is running.";
    }


    if (button) {

        button.disabled = false;

        button.innerText =
            button.dataset.oldText ||
            "Ask EduGenie";
    }
}


// ==========================================
// DASHBOARD QUICK ASK
// ==========================================

function askFromDashboard() {

    const input =
        document.getElementById(
            "dashboardQuestion"
        );

    const answer =
        document.getElementById(
            "dashboardAnswer"
        );

    if (!input || !answer) {
        return;
    }

    askAI(
        input.value,
        answer
    );
}


// ==========================================
// AI TUTOR
// ==========================================

function askTutor() {

    const question =
        document.getElementById(
            "tutorQuestion"
        );

    const difficulty =
        document.getElementById(
            "difficulty"
        );

    const answer =
        document.getElementById(
            "tutorAnswer"
        );

    if (!question || !answer) {
        return;
    }

    if (!question.value.trim()) {

        answer.innerText =
            "⚠️ Please enter a question.";

        answer.classList.remove("hidden");

        return;
    }

    const level =
        difficulty
            ? difficulty.value
            : "Intermediate";


    const enhancedQuestion = `

You are EduGenie, an AI learning tutor.

Teaching level:
${level}

Student question:
${question.value}

Explain this topic clearly.

Use:

- Simple language
- Step-by-step explanation
- Important points
- Practical example when useful
- Exam-focused points when useful

Help the student understand the concept.

`;

    askAI(
        enhancedQuestion,
        answer
    );
}


// ==========================================
// STUDY NOTES
// ==========================================

function generateNotes() {

    const topic =
        document.getElementById(
            "notesTopic"
        );

    const answer =
        document.getElementById(
            "notesAnswer"
        );

    if (!topic || !answer) {
        return;
    }

    if (!topic.value.trim()) {

        answer.innerText =
            "⚠️ Please enter a topic.";

        answer.classList.remove("hidden");

        return;
    }


    const prompt = `

Create detailed but easy-to-understand
study notes for:

${topic.value}

Use this structure:

1. Definition
2. Introduction
3. Main concepts
4. Important points
5. Real-world example
6. Advantages
7. Disadvantages
8. Exam-important points
9. Short summary

Make the notes suitable for a college student.

`;


    notesGenerated++;

    saveProgress();

    updateProgress();

    askAI(
        prompt,
        answer
    );
}


// ==========================================
// AI QUIZ GENERATOR
// ==========================================

function generateQuiz() {

    const topic =
        document.getElementById(
            "quizTopic"
        );

    const difficulty =
        document.getElementById(
            "quizDifficulty"
        );

    const count =
        document.getElementById(
            "quizCount"
        );

    const answer =
        document.getElementById(
            "quizAnswer"
        );

    if (!topic || !answer) {
        return;
    }

    if (!topic.value.trim()) {

        answer.innerText =
            "⚠️ Please enter a quiz topic.";

        answer.classList.remove("hidden");

        return;
    }


    const selectedDifficulty =
        difficulty
            ? difficulty.value
            : "Medium";

    const selectedCount =
        count
            ? count.value
            : "5";


    const prompt = `

Create ${selectedCount} multiple-choice
questions about:

${topic.value}

Difficulty:
${selectedDifficulty}

For every question provide:

Question:
A)
B)
C)
D)

Correct Answer:
Explanation:

Make the questions educational
and suitable for a college student.

Do not make every correct answer
the same option.

`;


    askAI(
        prompt,
        answer
    );
}


// ==========================================
// FLASHCARD GENERATOR
// ==========================================

function generateFlashcards() {

    const topic =
        document.getElementById(
            "flashcardTopic"
        );

    const answer =
        document.getElementById(
            "flashcardAnswer"
        );

    if (!topic || !answer) {
        return;
    }

    if (!topic.value.trim()) {

        answer.innerText =
            "⚠️ Please enter a topic.";

        answer.classList.remove("hidden");

        return;
    }


    const prompt = `

Create 10 useful study flashcards
for:

${topic.value}

Use this format:

Card 1
Question:
Answer:

Card 2
Question:
Answer:

Continue until Card 10.

Keep each answer short and useful
for quick revision.

`;


    askAI(
        prompt,
        answer
    );
}


// ==========================================
// REFERENCE GENERATOR
// ==========================================

function generateReferences() {

    const topic =
        document.getElementById(
            "referenceTopic"
        );

    const answer =
        document.getElementById(
            "referenceAnswer"
        );

    if (!topic || !answer) {
        return;
    }

    if (!topic.value.trim()) {

        answer.innerText =
            "⚠️ Please enter a topic.";

        answer.classList.remove("hidden");

        return;
    }


    const prompt = `

For the topic:

${topic.value}

Create a learning reference guide.

Include:

1. Important subtopics to study
2. Recommended types of resources
3. Official documentation to look for
4. Books or textbooks to look for
5. Useful search keywords
6. Beginner learning path
7. Advanced learning path

Do not invent specific URLs.

Clearly distinguish official
documentation from general resources.

`;


    askAI(
        prompt,
        answer
    );
}


// ==========================================
// LOCAL QUIZ DATABASE
// ==========================================

const localQuizDatabase = [

    {
        topic: "Computer Networks",

        question:
            "What does TCP stand for?",

        options: [
            "Transfer Control Protocol",
            "Transmission Control Protocol",
            "Transport Communication Protocol",
            "Terminal Control Protocol"
        ],

        answer: 1,

        explanation:
            "TCP stands for Transmission Control Protocol."
    },

    {
        topic: "Computer Networks",

        question:
            "Which device connects different networks?",

        options: [
            "Keyboard",
            "Monitor",
            "Router",
            "Printer"
        ],

        answer: 2,

        explanation:
            "A router connects and forwards data between different networks."
    },

    {
        topic: "Computer Networks",

        question:
            "What does IP stand for?",

        options: [
            "Internet Protocol",
            "Internal Process",
            "Internet Program",
            "Input Protocol"
        ],

        answer: 0,

        explanation:
            "IP stands for Internet Protocol."
    },

    {
        topic: "Operating System",

        question:
            "Which of the following is an operating system?",

        options: [
            "Windows",
            "Oracle",
            "Python",
            "HTML"
        ],

        answer: 0,

        explanation:
            "Windows is an operating system."
    },

    {
        topic: "Operating System",

        question:
            "Which component manages computer resources?",

        options: [
            "Operating System",
            "Web Browser",
            "Compiler",
            "Text Editor"
        ],

        answer: 0,

        explanation:
            "The operating system manages hardware and system resources."
    },

    {
        topic: "Java",

        question:
            "Which keyword is used to create a class in Java?",

        options: [
            "function",
            "class",
            "struct",
            "object"
        ],

        answer: 1,

        explanation:
            "The class keyword is used to declare a class in Java."
    },

    {
        topic: "Java",

        question:
            "Which method is the entry point of a Java application?",

        options: [
            "start()",
            "run()",
            "main()",
            "execute()"
        ],

        answer: 2,

        explanation:
            "The main() method is the standard entry point of a Java application."
    },

    {
        topic: "Python",

        question:
            "Which symbol is commonly used for comments in Python?",

        options: [
            "//",
            "/* */",
            "#",
            "<!-- -->"
        ],

        answer: 2,

        explanation:
            "Python uses # for single-line comments."
    },

    {
        topic: "Database",

        question:
            "Which language is commonly used to query relational databases?",

        options: [
            "HTML",
            "SQL",
            "CSS",
            "XML"
        ],

        answer: 1,

        explanation:
            "SQL is used to create, retrieve, update and manage relational database data."
    },

    {
        topic: "Database",

        question:
            "Which SQL command is used to retrieve data?",

        options: [
            "GET",
            "FETCH",
            "SELECT",
            "READ"
        ],

        answer: 2,

        explanation:
            "SELECT is used to retrieve data from a database."
    }

];


// ==========================================
// START QUIZ
// ==========================================

function startQuiz() {

    const topicElement =
        document.getElementById(
            "quizTopic"
        );

    const countElement =
        document.getElementById(
            "quizCount"
        );

    const setup =
        document.getElementById(
            "quizSetup"
        );

    const quizArea =
        document.getElementById(
            "quizArea"
        );

    const result =
        document.getElementById(
            "quizResult"
        );


    if (!setup || !quizArea) {
        return;
    }


    const topic =
        topicElement
            ? topicElement.value
                .trim()
                .toLowerCase()
            : "";


    let count =
        countElement
            ? parseInt(countElement.value)
            : 5;


    // ==========================================
    // FIND MATCHING QUESTIONS
    // ==========================================

    let filteredQuestions =
        localQuizDatabase.filter(
            question =>
                question.topic
                    .toLowerCase()
                    .includes(topic)
        );


    // If no exact topic is found,
    // use all available questions.

    if (
        filteredQuestions.length === 0
    ) {

        filteredQuestions =
            [...localQuizDatabase];
    }


    // Shuffle

    filteredQuestions =
        shuffleArray(
            filteredQuestions
        );


    // Limit number

    count =
        Math.min(
            count,
            filteredQuestions.length
        );


    quizQuestions =
        filteredQuestions.slice(
            0,
            count
        );


    currentQuestion = 0;

    quizScore = 0;

    selectedAnswer = null;


    setup.classList.add(
        "hidden"
    );

    quizArea.classList.remove(
        "hidden"
    );


    if (result) {

        result.classList.add(
            "hidden"
        );
    }


    // ==========================================
    // START TIMER
    // ==========================================

    startQuizTimer(
        quizQuestions.length
    );


    showQuizQuestion();
}


// ==========================================
// SHUFFLE
// ==========================================

function shuffleArray(array) {

    const shuffled =
        [...array];

    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            shuffled[i],
            shuffled[j]
        ] =
        [
            shuffled[j],
            shuffled[i]
        ];
    }

    return shuffled;
}


// ==========================================
// QUIZ TIMER
// ==========================================

function startQuizTimer(
    numberOfQuestions
) {

    stopQuizTimer();


    // 30 seconds per question

    quizTimeLeft =
        numberOfQuestions * 30;


    updateQuizTimerDisplay();


    quizTimer =
        setInterval(
            function () {

                quizTimeLeft--;

                updateQuizTimerDisplay();


                if (
                    quizTimeLeft <= 0
                ) {

                    stopQuizTimer();

                    finishQuiz();
                }

            },
            1000
        );
}


// ==========================================
// STOP TIMER
// ==========================================

function stopQuizTimer() {

    if (quizTimer) {

        clearInterval(
            quizTimer
        );

        quizTimer = null;
    }
}


// ==========================================
// TIMER DISPLAY
// ==========================================

function updateQuizTimerDisplay() {

    const timer =
        document.getElementById(
            "quizTimer"
        );


    if (!timer) {
        return;
    }


    const minutes =
        Math.floor(
            quizTimeLeft / 60
        );

    const seconds =
        quizTimeLeft % 60;


    timer.innerText =
        `⏱️ ${minutes}:${String(
            seconds
        ).padStart(2, "0")}`;


    if (
        quizTimeLeft <= 10
    ) {

        timer.classList.add(
            "timer-warning"
        );

    } else {

        timer.classList.remove(
            "timer-warning"
        );
    }
}


// ==========================================
// SHOW QUIZ QUESTION
// ==========================================

function showQuizQuestion() {

    const question =
        quizQuestions[
            currentQuestion
        ];


    if (!question) {

        finishQuiz();

        return;
    }


    const questionText =
        document.getElementById(
            "questionText"
        );

    const optionsContainer =
        document.getElementById(
            "optionsContainer"
        );

    const quizProgress =
        document.getElementById(
            "quizProgress"
        );

    const quizScoreDisplay =
        document.getElementById(
            "quizScore"
        );

    const nextButton =
        document.getElementById(
            "nextQuestionBtn"
        );


    if (questionText) {

        questionText.innerText =
            question.question;
    }


    if (quizProgress) {

        quizProgress.innerText =
            `Question ${
                currentQuestion + 1
            } of ${
                quizQuestions.length
            }`;
    }


    if (quizScoreDisplay) {

        quizScoreDisplay.innerText =
            `Score: ${quizScore}`;
    }


    if (nextButton) {

        nextButton.disabled =
            true;

        nextButton.innerText =
            currentQuestion ===
            quizQuestions.length - 1
                ? "Finish Quiz"
                : "Next Question";
    }


    selectedAnswer = null;


    if (!optionsContainer) {
        return;
    }


    optionsContainer.innerHTML =
        "";


    question.options.forEach(
        (option, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "quiz-option";

            button.innerText =
                `${String.fromCharCode(
                    65 + index
                )}. ${option}`;


            button.onclick =
                function () {

                    selectQuizOption(
                        index,
                        button
                    );
                };


            optionsContainer.appendChild(
                button
            );
        }
    );


    // ==========================================
    // QUESTION NAVIGATION
    // ==========================================

    updateQuizQuestionIndicator();
}


// ==========================================
// QUESTION INDICATOR
// ==========================================

function updateQuizQuestionIndicator() {

    const indicator =
        document.getElementById(
            "quizQuestionIndicator"
        );


    if (!indicator) {
        return;
    }


    indicator.innerHTML =
        "";


    quizQuestions.forEach(
        (question, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.innerText =
                index + 1;

            button.className =
                "quiz-number";


            if (
                index ===
                currentQuestion
            ) {

                button.classList.add(
                    "active"
                );
            }


            if (
                index <
                currentQuestion
            ) {

                button.classList.add(
                    "completed"
                );
            }


            button.onclick =
                function () {

                    if (
                        selectedAnswer !==
                        null ||
                        index <=
                        currentQuestion
                    ) {

                        currentQuestion =
                            index;

                        showQuizQuestion();
                    }
                };


            indicator.appendChild(
                button
            );
        }
    );
}


// ==========================================
// SELECT ANSWER
// ==========================================

function selectQuizOption(
    index,
    button
) {

    if (
        selectedAnswer !== null
    ) {

        return;
    }


    selectedAnswer =
        index;


    const question =
        quizQuestions[
            currentQuestion
        ];


    const options =
        document.querySelectorAll(
            ".quiz-option"
        );


    options.forEach(
        option => {

            option.disabled =
                true;
        }
    );


    if (
        index ===
        question.answer
    ) {

        button.classList.add(
            "correct"
        );

        quizScore++;

    } else {

        button.classList.add(
            "wrong"
        );


        if (
            options[
                question.answer
            ]
        ) {

            options[
                question.answer
            ].classList.add(
                "correct"
            );
        }
    }


    // ==========================================
    // EXPLANATION
    // ==========================================

    const explanation =
        document.createElement(
            "div"
        );

    explanation.className =
        "quiz-explanation";


    explanation.innerText =
        "💡 " +
        question.explanation;


    const container =
        document.getElementById(
            "optionsContainer"
        );


    if (container) {

        container.appendChild(
            explanation
        );
    }


    const nextButton =
        document.getElementById(
            "nextQuestionBtn"
        );


    if (nextButton) {

        nextButton.disabled =
            false;
    }


    const scoreDisplay =
        document.getElementById(
            "quizScore"
        );


    if (scoreDisplay) {

        scoreDisplay.innerText =
            `Score: ${quizScore}`;
    }


    updateQuizQuestionIndicator();
}


// ==========================================
// NEXT QUESTION
// ==========================================

function nextQuestion() {

    if (
        selectedAnswer === null
    ) {

        return;
    }


    currentQuestion++;


    if (
        currentQuestion >=
        quizQuestions.length
    ) {

        finishQuiz();

        return;
    }


    showQuizQuestion();
}


// ==========================================
// FINISH QUIZ
// ==========================================

function finishQuiz() {

    stopQuizTimer();


    const quizArea =
        document.getElementById(
            "quizArea"
        );

    const result =
        document.getElementById(
            "quizResult"
        );

    const finalScore =
        document.getElementById(
            "finalScore"
        );


    if (quizArea) {

        quizArea.classList.add(
            "hidden"
        );
    }


    if (result) {

        result.classList.remove(
            "hidden"
        );
    }


    const total =
        quizQuestions.length;


    const percentage =
        total > 0
            ? Math.round(
                (quizScore / total) *
                100
            )
            : 0;


    if (finalScore) {

        finalScore.innerText =
            `${quizScore} / ${total}`;
    }


    // ==========================================
    // EXTRA RESULT INFORMATION
    // ==========================================

    const percentageElement =
        document.getElementById(
            "quizPercentage"
        );


    if (percentageElement) {

        percentageElement.innerText =
            `${percentage}%`;
    }


    const gradeElement =
        document.getElementById(
            "quizGrade"
        );


    if (gradeElement) {

        gradeElement.innerText =
            getQuizGrade(
                percentage
            );
    }


    const messageElement =
        document.getElementById(
            "quizMessage"
        );


    if (messageElement) {

        messageElement.innerText =
            getQuizMessage(
                percentage
            );
    }


    quizzesCompleted++;

    saveProgress();

    updateProgress();
}


// ==========================================
// QUIZ GRADE
// ==========================================

function getQuizGrade(
    percentage
) {

    if (percentage >= 90) {
        return "Excellent";
    }

    if (percentage >= 75) {
        return "Very Good";
    }

    if (percentage >= 60) {
        return "Good";
    }

    if (percentage >= 40) {
        return "Keep Practicing";
    }

    return "Needs More Practice";
}


// ==========================================
// QUIZ MESSAGE
// ==========================================

function getQuizMessage(
    percentage
) {

    if (percentage >= 90) {

        return "🌟 Excellent work!";

    }

    if (percentage >= 75) {

        return "👏 Great job!";

    }

    if (percentage >= 60) {

        return "👍 Good effort!";

    }

    if (percentage >= 40) {

        return "📚 Keep studying and try again.";

    }

    return "💪 Don't give up. Practice makes progress!";
}


// ==========================================
// RESTART QUIZ
// ==========================================

function restartQuiz() {

    stopQuizTimer();


    const setup =
        document.getElementById(
            "quizSetup"
        );

    const quizArea =
        document.getElementById(
            "quizArea"
        );

    const result =
        document.getElementById(
            "quizResult"
        );


    if (setup) {

        setup.classList.remove(
            "hidden"
        );
    }


    if (quizArea) {

        quizArea.classList.add(
            "hidden"
        );
    }


    if (result) {

        result.classList.add(
            "hidden"
        );
    }


    quizQuestions = [];

    currentQuestion = 0;

    quizScore = 0;

    selectedAnswer = null;

    quizTimeLeft = 0;


    const timer =
        document.getElementById(
            "quizTimer"
        );


    if (timer) {

        timer.innerText =
            "⏱️ 0:00";
    }
}


// ==========================================
// QUESTION COUNTER
// ==========================================

function updateQuestionCounter() {

    const counter =
        document.getElementById(
            "questionsCount"
        );


    if (counter) {

        counter.innerText =
            questionsAsked;
    }
}


// ==========================================
// ENTER KEY SUPPORT
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProgress();


        // ==========================================
        // DASHBOARD
        // ==========================================

        const dashboardInput =
            document.getElementById(
                "dashboardQuestion"
            );


        if (dashboardInput) {

            dashboardInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        askFromDashboard();
                    }
                }
            );
        }


        // ==========================================
        // TUTOR
        // ==========================================

        const tutorInput =
            document.getElementById(
                "tutorQuestion"
            );


        if (tutorInput) {

            tutorInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter" &&
                        !event.shiftKey
                    ) {

                        event.preventDefault();

                        askTutor();
                    }
                }
            );
        }


        // ==========================================
        // NOTES
        // ==========================================

        const notesInput =
            document.getElementById(
                "notesTopic"
            );


        if (notesInput) {

            notesInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        generateNotes();
                    }
                }
            );
        }


        // ==========================================
        // FLASHCARDS
        // ==========================================

        const flashcardInput =
            document.getElementById(
                "flashcardTopic"
            );


        if (flashcardInput) {

            flashcardInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        generateFlashcards();
                    }
                }
            );
        }


        // ==========================================
        // REFERENCES
        // ==========================================

        const referenceInput =
            document.getElementById(
                "referenceTopic"
            );


        if (referenceInput) {

            referenceInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        generateReferences();
                    }
                }
            );
        }


        // ==========================================
        // NEXT QUESTION BUTTON
        // ==========================================

        const nextButton =
            document.getElementById(
                "nextQuestionBtn"
            );


        if (nextButton) {

            nextButton.addEventListener(
                "click",
                nextQuestion
            );
        }
    }
);


// ==========================================
// INITIAL PAGE LOAD
// ==========================================

window.addEventListener(
    "load",
    function () {

        loadProgress();

        updatePageTitle(
            "dashboard"
        );
    }
);