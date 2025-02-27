import { useEffect, useState } from 'react';
import {
  Container, Row, Col, ListGroup, InputGroup, FormControl, Button, Navbar, Nav,
  Modal, Tabs, Tab, Badge, Alert, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotificationContext';

const ChatHome = () => {
  const { user, APP_URL, formatDate, getCookie } = useAuth()
  const {error} = useNotify()

  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // Default to first chat ID
  // Friend Management States
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');
  const [friendRequestStatus, setFriendRequestStatus] = useState({ show: false, type: '', message: '' });
  const [activeTab, setActiveTab] = useState('friends');

  // Sample friends data - in a real app, these would be fetched from API
  const [friends, setFriends] = useState([
    { id: 1, username: 'User 1', status: 'online', avatar: '👩' },
    { id: 2, username: 'User 2', status: 'offline', avatar: '👨' },
    { id: 3, username: 'User 3', status: 'online', avatar: '👥' }
  ]);

  const [pendingRequests, setPendingRequests] = useState([
    { id: 4, username: 'User 4', status: 'pending', avatar: '👱‍♀️', requestId: '101' },
    { id: 5, username: 'User 5', status: 'pending', avatar: '🧑', requestId: '102' }
  ]);

  const [sentRequests, setSentRequests] = useState([
    { id: 6, username: 'User 6', status: 'sent', avatar: '👧', requestId: '103' }
  ]);

  const [currentChat, setCurrentChat] = useState(chats.find(chat => chat.id === activeChat));

  useEffect(()=>{
    fetch(`${APP_URL}/user/chats`,{
      credentials: 'include'
    }).then(resp =>{
      if(resp.ok){
        resp.json().then(data =>{
          setChats(data)
          setActiveChat(data[0].id)
        })
      }else{
        console.error(resp)
      }
    })
  }, [])

  useEffect(() => {
    if (activeChat) {
      fetch(`${APP_URL}/chats/${activeChat}`, {
        credentials: 'include'
      }).then(resp => {
        if (resp.ok) {
          resp.json().then(setCurrentChat)
        }
      })
      setCurrentChat(chats.find(chat => chat.id === activeChat));
    }
  }, [activeChat, chats]);



  // Get the name and avatar for the current chat
  // const getContactInfo = (userId) => {
  //   return {
  //     name: `User ${userId}`,
  //     avatar: ['👩', '👨', '👥'][userId - 1] || '🧑'
  //   };
  // };

  // const currentContact = currentChat ? getContactInfo(currentChat.chattingWith.id) : { name: '', avatar: '🧑' };

  const handleSendMessage = () => {
    if (message.trim()) {

      fetch(`${APP_URL}/messages/send`,{
        method: 'POST',
        credentials: 'include',
        headers:{
          "Content-Type":'application/json',
          'X-CSRF-TOKEN':getCookie('csrf_access_token')
        },
        body: JSON.stringify({'message':message, 'chat_id':currentChat.id})
      }).then(resp =>{
        if(resp.ok){
          resp.json().then(console.log)
        }else{
          error(resp)
        }
      })

      const updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, newMessage]
      };

      setChats(chats.map(chat =>
        chat.id === currentChat.id ? updatedChat : chat
      ));

      setCurrentChat(updatedChat);
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
    console.log(senderId)
    return senderId === user?.id;
  };

  // Friend request handlers
  const handleSendFriendRequest = () => {
    if (!friendUsername.trim()) {
      setFriendRequestStatus({
        show: true,
        type: 'danger',
        message: 'Please enter a username'
      });
      return;
    }

    // Check if already friends
    const existingFriend = friends.find(f => f.username.toLowerCase() === friendUsername.toLowerCase());
    if (existingFriend) {
      setFriendRequestStatus({
        show: true,
        type: 'warning',
        message: `You are already friends with ${friendUsername}`
      });
      return;
    }

    // Check if already sent a request
    const existingSent = sentRequests.find(r => r.username.toLowerCase() === friendUsername.toLowerCase());
    if (existingSent) {
      setFriendRequestStatus({
        show: true,
        type: 'warning',
        message: `You already sent a request to ${friendUsername}`
      });
      return;
    }

    const newRequest = {
      id: Math.max(...sentRequests.map(r => r.id), 0) + 1,
      username: friendUsername,
      status: 'sent',
      avatar: '👤',
      requestId: `sent-${Date.now()}`
    };

    setSentRequests([...sentRequests, newRequest]);

    setFriendRequestStatus({
      show: true,
      type: 'success',
      message: `Friend request sent to ${friendUsername}`
    });

    setFriendUsername('');
  };

  const handleAcceptRequest = (requestId) => {
    // Find the request
    const request = pendingRequests.find(r => r.requestId === requestId);
    if (!request) return;

    // In a real app, you would call an API to accept the request
    // For demo, we'll add to friends and remove from pending
    const newFriend = {
      id: request.id,
      username: request.username,
      status: 'online',
      avatar: request.avatar
    };

    setFriends([...friends, newFriend]);
    setPendingRequests(pendingRequests.filter(r => r.requestId !== requestId));
  };

  const handleRejectRequest = (requestId) => {
    setPendingRequests(pendingRequests.filter(r => r.requestId !== requestId));
  };

  const handleCancelRequest = (requestId) => {
    setSentRequests(sentRequests.filter(r => r.requestId !== requestId));
  };

  const handleStartChat = (friendId) => {
    // Check if a chat already exists with this friend
    let existingChat = chats.find(chat => chat.chattingWith.id === friendId);

    if (existingChat) {
      setActiveChat(existingChat.id);
    } else {
      // Create a new chat
      const friend = friends.find(f => f.id === friendId);
      if (!friend) return;

      const newChat = {
        id: Math.max(...chats.map(c => c.id)) + 1,
        chattingWith: {
          id: friend.id,
          username: friend.username
        },
        messages: []
      };

      setChats([...chats, newChat]);
      setActiveChat(newChat.id);
    }

    setShowFriendsModal(false);
  };

  useEffect(()=>{
    if(currentChat && currentChat.participants) console.log(currentChat.participants.filter(u => u.user.id !== user.id))
    
  },[currentChat])

  return (
    <Container fluid className="p-0 vh-100 d-flex flex-column">
      {/* Navbar */}
      <Navbar bg="primary" variant="dark" className="flex-shrink-0">
        <Container>
          <Navbar.Brand href="#home">Chat App</Navbar.Brand>
          <Nav className="ms-auto">
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>Friends</Tooltip>}
            >
              <Nav.Link onClick={() => setShowFriendsModal(true)}>
                <i className="bi bi-people">{pendingRequests.length > 0 && (
                  <Badge bg="danger" pill className="position-absolute top-5 start-95 translate-middle">
                    {pendingRequests.length}
                  </Badge>
                )}</i>

              </Nav.Link>
            </OverlayTrigger>
            <Nav.Link href="#settings"><i className="bi bi-gear"></i></Nav.Link>
            <Nav.Link href="#profile"><i className="bi bi-person-circle"></i></Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Row className="flex-grow-1 m-0">
        {/* Chats sidebar */}
        <Col md={4} className="p-0 border-end vh-100 overflow-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Chats</h5>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowFriendsModal(true)}
            >
              <i className="bi bi-plus-circle me-1"></i> New Chat
            </Button>
          </div>
          <ListGroup variant="flush">
            {chats.map((chat) => {
              const contact = chat.participants.find(u => u.user.id !== user?.id);
              const lastMessage = chat.last_message;

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
                      <span style={{ fontSize: '1.5rem' }}>👨</span>
                      <span className="position-absolute bottom-0 end-0 bg-success rounded-circle" style={{ width: '10px', height: '10px' }}></span>
                    </div>
                    <div>
                      <div className="fw-bold">{contact.user.username}</div>
                      <small className="text-muted text-truncate" style={{ maxWidth: '150px', display: 'block' }}>
                        {lastMessage.message}
                      </small>
                    </div>
                  </div>
                  <div className="text-end">
                    <small className="text-muted d-block">{lastMessage ? formatDate(lastMessage.created_at) : ''}</small>
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Col>

        {/* Chat area */}
        <Col md={8} className="p-0 d-flex flex-column vh-100" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          {currentChat ? (
            <>
              {/* Chat header */}
              <div className="border-bottom p-3 d-flex justify-content-between align-items-center bg-light">
                <div className="d-flex align-items-center">
                  {/* <span style={{ fontSize: '1.5rem' }} className="me-2">{currentContact.avatar}</span> */}
                  <h5 className="mb-0">{currentChat.participants.find(p => p.user.id !== user.id).id}</h5>
                </div>
                <div>
                  {/* Chat options could go here */}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-grow-1 p-3 overflow-auto bg-light" style={{ maxHeight: 'calc(100vh - 170px)' }}>
                {currentChat.messages && currentChat.messages.length > 0 ? (
                  currentChat.messages.map((msg) => {
                    const isMine = isMyMessage(msg.sender_id);
                    return (
                      <div
                        key={msg.id}
                        className={`d-flex mb-3 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}
                      >
                        {!isMine && (
                          <div className="me-2">
                            {/* <span style={{ fontSize: '1.5rem' }}>{currentContact.avatar}</span> */}
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-3 ${isMine ? 'bg-primary text-white' : 'bg-white border'}`}
                          style={{ maxWidth: '75%' }}
                        >
                          <div>{msg.message}</div>
                          <small className={`d-block text-end mt-1 ${isMine ? 'text-light' : 'text-muted'}`}>
                            {formatDate(msg.created_at)}
                            
                          </small>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="text-center p-4">
                      <div className="mb-3">
                        <i className="bi bi-chat-dots" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                      </div>
                      <h5 className="text-muted">No messages yet</h5>
                      <p className="text-muted small">Start the conversation by sending a message!</p>
                    </div>
                  </div>
                )}
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
                  <Button variant="primary" onClick={handleSendMessage}>
                    <i className="bi bi-send"></i>
                  </Button>
                </InputGroup>
              </div>
            </>
          ) : (
            <div className="d-flex flex-column justify-content-center align-items-center h-100 bg-light">
              <div style={{ fontSize: '4rem' }}>💬</div>
              <h4>Select a chat or start a new conversation</h4>
              <Button
                variant="primary"
                className="mt-3"
                onClick={() => setShowFriendsModal(true)}
              >
                Start New Chat
              </Button>
            </div>
          )}
        </Col>
      </Row>

      {/* Friends Modal */}
      <Modal show={showFriendsModal} onHide={() => setShowFriendsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Manage Friends</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="friends" title="Friends">
              <Row className="mb-3">
                <Col>
                  <FormControl
                    placeholder="Search friends..."
                    onChange={(e) => {
                      // Implement friend search functionality
                    }}
                  />
                </Col>
              </Row>

              <ListGroup>
                {friends.map((friend) => (
                  <ListGroup.Item key={friend.id} className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="me-3 position-relative">
                        <span style={{ fontSize: '1.5rem' }}>{friend.avatar}</span>
                        <span
                          className={`position-absolute bottom-0 end-0 rounded-circle ${friend.status === 'online' ? 'bg-success' : 'bg-secondary'}`}
                          style={{ width: '10px', height: '10px' }}
                        ></span>
                      </div>
                      <div>
                        <div className="fw-bold">{friend.username}</div>
                        <small className="text-muted">{friend.status === 'online' ? 'Online' : 'Offline'}</small>
                      </div>
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleStartChat(friend.id)}
                    >
                      <i className="bi bi-chat-dots me-1"></i> Chat
                    </Button>
                  </ListGroup.Item>
                ))}

                {friends.length === 0 && (
                  <div className="text-center p-3">
                    <p>You don't have any friends yet.</p>
                    <Button onClick={() => setActiveTab('add-friend')}>Add Friends</Button>
                  </div>
                )}
              </ListGroup>
            </Tab>

            <Tab
              eventKey="pending"
              title={
                <span>
                  Pending Requests
                  {pendingRequests.length > 0 && (
                    <Badge bg="danger" pill className="ms-1">
                      {pendingRequests.length}
                    </Badge>
                  )}
                </span>
              }
            >
              <ListGroup>
                {pendingRequests.map((request) => (
                  <ListGroup.Item key={request.id} className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <span style={{ fontSize: '1.5rem' }}>{request.avatar}</span>
                      </div>
                      <div>
                        <div className="fw-bold">{request.username}</div>
                        <small className="text-muted">Wants to be friends</small>
                      </div>
                    </div>
                    <div>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleAcceptRequest(request.requestId)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRejectRequest(request.requestId)}
                      >
                        Decline
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}

                {pendingRequests.length === 0 && (
                  <div className="text-center p-3">
                    <p>No pending friend requests</p>
                  </div>
                )}
              </ListGroup>
            </Tab>

            <Tab eventKey="sent-requests" title="Sent Requests">
              <ListGroup>
                {sentRequests.map((request) => (
                  <ListGroup.Item key={request.id} className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <span style={{ fontSize: '1.5rem' }}>{request.avatar}</span>
                      </div>
                      <div>
                        <div className="fw-bold">{request.username}</div>
                        <small className="text-muted">Request pending</small>
                      </div>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleCancelRequest(request.requestId)}
                    >
                      Cancel
                    </Button>
                  </ListGroup.Item>
                ))}

                {sentRequests.length === 0 && (
                  <div className="text-center p-3">
                    <p>No sent friend requests</p>
                  </div>
                )}
              </ListGroup>
            </Tab>

            <Tab eventKey="add-friend" title="Add Friend">
              {friendRequestStatus.show && (
                <Alert
                  variant={friendRequestStatus.type}
                  dismissible
                  onClose={() => setFriendRequestStatus({ ...friendRequestStatus, show: false })}
                >
                  {friendRequestStatus.message}
                </Alert>
              )}

              <div className="mb-3">
                <p>Enter a username to send a friend request:</p>
                <InputGroup className="mb-3">
                  <FormControl
                    placeholder="Username"
                    value={friendUsername}
                    onChange={(e) => setFriendUsername(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendFriendRequest();
                      }
                    }}
                  />
                  <Button
                    variant="primary"
                    onClick={handleSendFriendRequest}
                  >
                    Send Request
                  </Button>
                </InputGroup>
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFriendsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ChatHome;