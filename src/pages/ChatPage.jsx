import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  getAllUsers, 
  getChatMessages, 
  sendChatMessage 
} from "../firebase/services";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { 
  MessageSquare, 
  Send, 
  Search, 
  User, 
  MessageCircle, 
  ShieldCheck, 
  Info,
  Clock
} from "lucide-react";

const ChatPage = () => {
  const { user, userProfile } = useAuth();
  
  // States
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Fetch registered users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const users = await getAllUsers();
        // Exclude currently logged-in user from the chat contacts list
        const otherUsers = users.filter(u => u.uid !== user.uid);
        setUsersList(otherUsers);
      } catch (err) {
        console.error("Failed to load chat users directory:", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  // Establish real-time listener when contact changes
  useEffect(() => {
    if (!user || !selectedContact) return;

    // Generate unique chatId by sorting UIDs (prevents duplicates)
    const sortedIds = [user.uid, selectedContact.uid].sort();
    const chatId = `${sortedIds[0]}_${sortedIds[1]}`;

    // Establish listener
    const unsubscribe = getChatMessages(chatId, (chatMessages) => {
      setMessages(chatMessages);
    });

    // Clean up listener on unmount or contact swap
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedContact, user]);

  // Scroll to bottom whenever messages list is updated
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

    const textToSend = inputText.trim();
    setInputText(""); // Instant clearing for snappy response

    const sortedIds = [user.uid, selectedContact.uid].sort();
    const chatId = `${sortedIds[0]}_${sortedIds[1]}`;

    try {
      await sendChatMessage(chatId, {
        senderId: user.uid,
        text: textToSend
      });
    } catch (err) {
      console.error("Sending message failed:", err);
      alert("Failed to deliver message.");
    }
  };

  // Filter contacts by search
  const filteredContacts = usersList.filter(contact => {
    return (
      contact.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getInitials = (name) => {
    if (!name) return "C";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const formatMessageTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className="main-content">
        <Header title="Collaborative Live Chat" />
        
        <div className="page-wrapper" style={{ paddingBottom: "1rem" }}>
          <div className="chat-layout">
            
            {/* 1. CONTACTS LIST PANEL */}
            <div className="chat-users-panel">
              <div className="chat-users-header">
                <h2>Direct Messages</h2>
                
                {/* Search */}
                <div className="search-chat-users">
                  <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    className="form-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: "32px", padding: "0.45rem 0.75rem 0.45rem 32px", fontSize: "0.82rem" }}
                  />
                </div>
              </div>

              <div className="chat-users-list">
                {loadingUsers ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                    <div className="spinner" style={{ width: "24px", height: "24px", borderWidth: "2.5px" }}></div>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-tertiary)", fontSize: "0.82rem" }}>
                    No contacts found.
                  </div>
                ) : (
                  filteredContacts.map(contact => (
                    <div 
                      key={contact.uid}
                      onClick={() => setSelectedContact(contact)}
                      className={`chat-user-item ${selectedContact?.uid === contact.uid ? "active" : ""}`}
                    >
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: selectedContact?.uid === contact.uid ? "var(--bg-secondary)" : "var(--primary-light)",
                        color: selectedContact?.uid === contact.uid ? "var(--primary)" : "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        position: "relative",
                        border: "1px solid var(--border-light)",
                        overflow: "hidden"
                      }}>
                        {contact.photoURL ? (
                          <img src={contact.photoURL} alt={contact.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          getInitials(contact.displayName)
                        )}
                        <span style={{ position: "absolute", bottom: 0, right: 0 }} className="online-dot"></span>
                      </div>

                      <div className="chat-user-info">
                        <div className="chat-user-name">
                          <span>{contact.displayName}</span>
                          <span className={`role-badge ${contact.role === "admin" ? "admin" : "user"}`} style={{ fontSize: "0.55rem", padding: "0 0.25rem" }}>
                            {contact.role}
                          </span>
                        </div>
                        <div className="chat-user-email">{contact.email}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. CHAT WINDOW PANE */}
            <div className="chat-window">
              {selectedContact ? (
                <>
                  {/* Chat Window Header */}
                  <div className="chat-window-header">
                    <div style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "var(--primary-light)",
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      border: "1.5px solid var(--primary)",
                      overflow: "hidden"
                    }}>
                      {selectedContact.photoURL ? (
                        <img src={selectedContact.photoURL} alt={selectedContact.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        getInitials(selectedContact.displayName)
                      )}
                    </div>
                    
                    <div className="chat-window-title">
                      <h3>{selectedContact.displayName}</h3>
                      <span>{selectedContact.email}</span>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="chat-messages-container">
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                      fontSize: "0.75rem",
                      color: "var(--text-tertiary)",
                      backgroundColor: "var(--bg-secondary)",
                      padding: "0.4rem 0.75rem",
                      borderRadius: "var(--radius-md)",
                      width: "fit-content",
                      margin: "0 auto 1rem",
                      border: "1px solid var(--border-light)"
                    }}>
                      <ShieldCheck size={14} color="var(--success)" /> End-to-end secure session channel
                    </div>

                    {messages.length === 0 ? (
                      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: "0.9rem", fontStyle: "italic" }}>
                        Send a message to launch coordination.
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isSentByMe = msg.senderId === user.uid;
                        
                        return (
                          <div 
                            key={msg.id}
                            className={`message-bubble-wrapper ${isSentByMe ? "sent" : "received"}`}
                          >
                            <div className="message-bubble">
                              <p>{msg.text}</p>
                              <span className="message-time">
                                {formatMessageTime(msg.timestamp)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input Bar */}
                  <form onSubmit={handleSendMessage} className="chat-input-bar">
                    <input
                      type="text"
                      className="chat-input-field"
                      placeholder={`Message ${selectedContact.displayName}...`}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    <button type="submit" className="chat-send-btn" disabled={!inputText.trim()}>
                      <Send size={16} />
                    </button>
                  </form>
                </>
              ) : (
                /* Empty placeholder state */
                <div className="chat-placeholder-container">
                  <div style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--primary-light)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "0.5rem"
                  }}>
                    <MessageCircle size={32} />
                  </div>
                  <h3>Establish Secure Link</h3>
                  <p style={{ maxWidth: "340px", fontSize: "0.88rem", lineHeight: "1.45" }}>
                    Select a registered member from the DM list to establish an encrypted coordinate channel. Messages sync in real-time.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
