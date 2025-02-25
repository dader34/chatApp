import { useEffect, useState } from 'react';
import { Container, Row, Col, ListGroup, InputGroup, FormControl, Button, Navbar, Nav } from 'react-bootstrap';


const ChatHome = () => {

  const chats = [
    {
      id: 1,
      chattingWith: {
        id: 1,
        username: 'User 1'
      },
      messages: [
        { id: 1, sender: 1, chatId: 1, text: 'Hey, how\'s it going?', time: '10:15 AM' },
        { id: 2, sender: 2, chatId: 1, text: 'Good! How about you?', time: '10:20 AM' }
      ]
    },
    {
      id: 2,
      chattingWith: {
        id: 2,
        username: 'User 2'
      },
      messages: [
        { id: 3, sender: 1, chatId: 2, text: 'Did you finish the project?', time: '11:05 AM' },
        { id: 4, sender: 2, chatId: 2, text: 'Almost done, just a few tweaks left.', time: '11:10 AM' }
      ]
    },
    {
      id: 3,
      chattingWith: {
        id: 3,
        username: 'User 3'
      },
      messages: [
        { id: 5, sender: 1, chatId: 3, text: 'Let\'s catch up this weekend!', time: '9:30 AM' },
        { id: 6, sender: 3, chatId: 3, text: 'Sounds great! Let me know the time.', time: '9:45 AM' }
      ]
    }
  ];

  const [message, setMessage] = useState('');
  const [activeChat, setActiveChat] = useState(1); // Default to first chat ID
  const [currentChat, setCurrentChat] = useState(chats.find(chat => chat.id === activeChat))
  
  // Sample contact data
  // const contacts = [
  //   { id: 0, name: 'Sarah Johnson', avatar: '👩', status: 'online', lastMessage: 'See you tomorrow!', unread: 0, time: '10:30 AM' },
  //   { id: 1, name: 'Mike Chen', avatar: '👨', status: 'online', lastMessage: 'Can you send me the report?', unread: 3, time: '9:15 AM' },
  //   { id: 2, name: 'Team Hangout', avatar: '👥', status: 'offline', lastMessage: 'John: Great job everyone!', unread: 0, time: 'Yesterday' },
  //   { id: 3, name: 'Emma Wilson', avatar: '👱‍♀️', status: 'offline', lastMessage: 'Thanks for your help!', unread: 0, time: 'Yesterday' },
  //   { id: 4, name: 'David Kim', avatar: '🧑', status: 'online', lastMessage: 'Let me check and get back to you', unread: 0, time: 'Monday' },
  // ];

  useEffect(()=>{
    setCurrentChat(chats.find(chat => chat.id === activeChat))
  },[activeChat])
  
  // Get the name and avatar for the current chat
  const getContactInfo = (userId) => {
    return {
      name: `User ${userId}`,
      avatar: ['👩', '👨', '👥'][userId - 1] || '🧑'
    };
  };
  
  const currentContact = getContactInfo(currentChat.chattingWith.id);
  
  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, you would add the message to state and send to a backend
      // For now, we could simulate adding a message to the current chat
      
      // This is just for demonstration - in a real app, you'd update state properly
      const newMessage = {
        id: Math.max(...currentChat.messages.map(m => m.id)) + 1,
        sender: 2, // Assuming current user is sender 2
        chatId: currentChat.id,
        text: message,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }

      setCurrentChat((prev)=>({
        ...prev,
        messages: [...prev.messages, newMessage]
      }))
      
      setMessage('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  // Function to determine if a message is from the current user
  const isMyMessage = (senderId) => {
    // current user has id of 2 for testing rn
    return senderId === 2;
  };
  
  return (
    <Container fluid className="p-0 vh-100 d-flex flex-column">
      {/* Navbar */}
      <Navbar bg="primary" variant="dark" className="flex-shrink-0">
        <Container>
          <Navbar.Brand href="#home">Chat App</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link href="#settings"><i className="bi bi-gear"></i></Nav.Link>
            <Nav.Link href="#profile"><i className="bi bi-person-circle"></i></Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      
      <Row className="flex-grow-1 m-0">
        {/* Chats sidebar */}
        <Col md={4} className="p-0 border-end vh-100 overflow-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          <ListGroup variant="flush">
            {chats.map((chat) => {
              const contact = getContactInfo(chat.chattingWith.id);
              const lastMessage = chat.messages[chat.messages.length - 1];
              
              return (
                <ListGroup.Item 
                  key={chat.id}
                  action
                  active={activeChat === chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className="d-flex justify-content-between align-items-center py-3"
                >
                  <div className="d-flex align-items-center">
                    <div className="me-3 position-relative">
                      <span style={{ fontSize: '1.5rem' }}>{contact.avatar}</span>
                      <span className="position-absolute bottom-0 end-0 bg-success rounded-circle" style={{ width: '10px', height: '10px' }}></span>
                    </div>
                    <div>
                      <div className="fw-bold">{contact.name}</div>
                      <small className="text-muted text-truncate" style={{ maxWidth: '150px', display: 'block' }}>
                        {lastMessage ? lastMessage.text : 'No messages yet'}
                      </small>
                    </div>
                  </div>
                  <div className="text-end">
                    <small className="text-muted d-block">{lastMessage ? lastMessage.time : ''}</small>
                    {/* Add unread badge later */}
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Col>
        
        {/* Chat area */}
        <Col md={8} className="p-0 d-flex flex-column vh-100" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          {/* Chat header */}
          <div className="border-bottom p-3 d-flex justify-content-between align-items-center bg-light">
            <div className="d-flex align-items-center">
              <span style={{ fontSize: '1.5rem' }} className="me-2">{currentContact.avatar}</span>
              <h5 className="mb-0">{currentContact.name}</h5>
            </div>
            <div>
              {/* <Button variant="outline-secondary" size="sm" className="me-2">
                <i className="bi bi-telephone"></i>
              </Button>
              <Button variant="outline-secondary" size="sm" className="me-2">
                <i className="bi bi-camera-video"></i>
              </Button>
              <Button variant="outline-secondary" size="sm">
                <i className="bi bi-three-dots-vertical"></i>
              </Button> */}
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-grow-1 p-3 overflow-auto bg-light" style={{ maxHeight: 'calc(100vh - 170px)' }}>
            {currentChat.messages.map((msg) => {
              const isMine = isMyMessage(msg.sender);
              return (
                <div 
                  key={msg.id} 
                  className={`d-flex mb-3 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  {!isMine && (
                    <div className="me-2">
                      <span style={{ fontSize: '1.5rem' }}>{currentContact.avatar}</span>
                    </div>
                  )}
                  <div 
                    className={`p-3 rounded-3 ${isMine ? 'bg-primary text-white' : 'bg-white border'}`}
                    style={{ maxWidth: '75%' }}
                  >
                    <div>{msg.text}</div>
                    <small className={`d-block text-end mt-1 ${isMine ? 'text-light' : 'text-muted'}`}>
                      {msg.time || 'Now'}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Message input */}
          <div className="p-3 border-top mt-auto">
            <InputGroup>
              <Button variant="outline-secondary">
                <i className="bi bi-plus-circle"></i>
              </Button>
              <FormControl
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button variant="outline-secondary">
                <i className="bi bi-emoji-smile"></i>
              </Button>
              {/* <Button variant="outline-secondary">
                <i className="bi bi-mic"></i>
              </Button> */}
              <Button variant="primary" onClick={handleSendMessage}>
                <i className="bi bi-send"></i>
              </Button>
            </InputGroup>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default ChatHome;