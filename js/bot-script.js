import { supabase } from '../serverClient.js';

const apiKey = "AIzaSyCzwz4puVfYrahJbciYecD2jxKROB8ZQpY";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

let assistantInstructions = '';
let quickReplies = [];
let chatHistory = [];
let isFirstMessage = true;
let hasShownQuickReplies = false;

let currentRoomInfo = null;  // holds the selected room’s info


const chatWidget = document.getElementById("chat-widget");
const chatbox = document.getElementById("chatbox");
const chatHeader = document.getElementById("chat-header");
const maximizeBtn = document.getElementById("maximize-btn");
const minimizeBtn = document.getElementById("minimize-btn");
const closeBtn = document.getElementById("close-btn");


// Restore widget to default position
function resetPosition() {
  chatWidget.style.position = "fixed";
  chatWidget.style.bottom = "30px";
  chatWidget.style.right = "30px";
  chatWidget.style.top = "";
  chatWidget.style.left = "";
  chatWidget.style.transform = "";
}

// Fetch settings from Supabase
async function fetchSettings() {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("type, content");

    if (error) throw error;

    data.forEach((item) => {
      if (item.type === "instructions") assistantInstructions = item.content;
      if (item.type === "quickReplies") quickReplies = item.content.split(",").map(s => s.trim());
    });
  } catch (err) {
    console.error("Error fetching Supabase settings:", err);
    assistantInstructions = "do not answer";
  }
}

// Widget open
chatWidget.addEventListener("click", () => {
  if (chatWidget.classList.contains("launcher-state")) {
    chatWidget.classList.remove("launcher-state");
    chatWidget.classList.add("open");
    maximizeBtn.style.display = "inline-flex";
    minimizeBtn.style.display = "none";
    currentRoomInfo = null;
    if (chatbox.childElementCount === 0) {
      fetchSettings().then(() => {
        appendMessage("Hello! This is chat support for Windsor Residences. How may I assist you today?", "bot");
      });
    }
  }
});

document.addEventListener('click', (e) => {
  const chatBtn = e.target.closest('.chat-btn');
  if (!chatBtn) return;

  const room = chatBtn.dataset.room ? JSON.parse(chatBtn.dataset.room) : null;

  const chatWidget = document.getElementById('chat-widget');
  const chatbox = document.getElementById('chatbox');
  const maximizeBtn = document.getElementById('maximize-btn');
  const minimizeBtn = document.getElementById('minimize-btn');
  const quickReplies = document.getElementsByClassName("quick-reply");

 
  chatWidget.classList.remove('launcher-state');
  chatWidget.classList.add('open');
  maximizeBtn.style.display = "inline-flex";
  minimizeBtn.style.display = "none";


  [...quickReplies].forEach(el => el.style.display = "none");

  document.getElementById('userInput').focus();

  if (room) {
    currentRoomInfo = `
      Room ${room.room_no} at ${room.location}, 
      for ${room.pax} pax, priced at ₱${Number(room.rental_price).toLocaleString()} per month.
      Amenities: ${room.amenities.join(', ')}.
      Inclusions: ${room.inclusions.join(', ')}.
    `;

  
    chatbox.innerHTML = '';
    chatHistory = [];
    isFirstMessage = true;

    appendMessage("How may I help you?", "bot", false);
  }
});





// Close widget
closeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  chatWidget.classList.remove("open", "fullscreen");
  chatWidget.classList.add("launcher-state");
  resetPosition();
  // Reset chat state
  currentRoomInfo = null;
  chatbox.innerHTML = '';
  chatHistory = [];
  isFirstMessage = true;
  hasShownQuickReplies = false; // reset here
});


// Fullscreen
maximizeBtn.addEventListener("click", () => {
  chatWidget.classList.add("fullscreen");
  maximizeBtn.style.display = "none";
  minimizeBtn.style.display = "inline-flex";
  resetPosition();
});

// Minimize
minimizeBtn.addEventListener("click", () => {
  chatWidget.classList.remove("fullscreen");
  minimizeBtn.style.display = "none";
  maximizeBtn.style.display = "inline-flex";
  resetPosition();
});

// Drag
let isDragging = false, offsetX = 0, offsetY = 0;

chatHeader.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - chatWidget.offsetLeft;
  offsetY = e.clientY - chatWidget.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    chatWidget.style.position = "fixed";
    chatWidget.style.left = `${e.clientX - offsetX}px`;
    chatWidget.style.top = `${e.clientY - offsetY}px`;
    chatWidget.style.bottom = "";
    chatWidget.style.right = "";
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// Input handling
document.getElementById("userInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
document.getElementById("sendBtn").addEventListener("click", sendMessage);

// Display messages
function appendMessage(text, sender, showQuickReplies = true) {
  const msg = document.createElement("div");
  msg.className = `msg ${sender}`;
  msg.textContent = text;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;


  if (sender === "bot" && showQuickReplies && quickReplies.length > 0 && !hasShownQuickReplies) {
    hasShownQuickReplies = true; // mark as shown
    const wrapper = document.createElement("div");
    wrapper.className = "quick-replies";

    const maxVisible = 2;
    const hiddenReplies = [];

    quickReplies.forEach((reply, index) => {
      const btn = document.createElement("button");
      btn.className = "quick-reply";
      btn.textContent = reply;
      btn.onclick = () => {
        document.getElementById("userInput").value = reply;
        sendMessage();
      };

      if (index < maxVisible) {
        wrapper.appendChild(btn);
      } else {
        btn.style.display = "none";
        hiddenReplies.push(btn);
        wrapper.appendChild(btn);
      }
    });

    if (quickReplies.length > maxVisible) {
      const toggleBtn = document.createElement("button");
      toggleBtn.className = "quick-reply";
      toggleBtn.innerHTML = '<i class="fa-solid fa-caret-right"></i>';

      toggleBtn.onclick = () => {
        const isExpanded = toggleBtn.innerHTML.includes("left");
        hiddenReplies.forEach(btn => {
          btn.style.display = isExpanded ? "none" : "inline-block";
        });
        toggleBtn.innerHTML = isExpanded
          ? '<i class="fa-solid fa-caret-right"></i>'
          : '<i class="fa-solid fa-caret-left"></i>';
      };

      wrapper.appendChild(toggleBtn);
    }

    chatbox.appendChild(wrapper);
    chatbox.scrollTop = chatbox.scrollHeight;
  }
}


// Typing indicator
function showTypingIndicator() {
  if (document.getElementById("typing-indicator")) return;
  const indicator = document.createElement("div");
  indicator.className = "typing-indicator bot";
  indicator.id = "typing-indicator";
  indicator.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
  chatbox.appendChild(indicator);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function removeTypingIndicator() {
  const existing = document.getElementById("typing-indicator");
  if (existing) existing.remove();
}

// Send message
async function sendMessage() {
  const inputField = document.getElementById("userInput");
  const userText = inputField.value.trim();
  if (!userText) return;

  appendMessage(userText, "user");
  inputField.value = "";
  showTypingIndicator();

  const roomContext = currentRoomInfo || "No specific room selected.";
  const prompt = `
  ${assistantInstructions}

  Context about the room (if any):
  ${roomContext}

  Guidelines for your responses:
  - Keep answers short and concise (2–3 sentences maximum).
  - Focus only on information related to Windsor Residences rooms, amenities, availability, or reservations.
  - If the user asks something unrelated, politely redirect them back to room inquiries.
  - Always maintain a friendly and professional tone.
  - Strictly do not use asterisks (*) or underscores (_) for formatting.

  User: ${userText}
  `;


  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          ...chatHistory, // keep history
          { role: "user", parts: [{ text: prompt }] }
        ]
      }),
    });

    if (!response.ok) throw new Error("HTTP error");

    const result = await response.json();
    const reply = result?.candidates?.[0]?.content?.parts?.[0]?.text 
      || "I'm sorry, I couldn't process that.";

    chatHistory.push({ role: "model", parts: [{ text: reply }] });

    removeTypingIndicator();
    appendMessage(reply, "bot");
  } catch (error) {
    console.error("Gemini API error:", error);
    removeTypingIndicator();
    appendMessage("Sorry, there was a problem. Please try again.", "bot");
  }
}


