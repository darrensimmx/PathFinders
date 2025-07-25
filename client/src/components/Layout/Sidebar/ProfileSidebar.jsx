import BackBtn from '../../Assets/BackBtn.png'
import Avatar from '../../Assets/Avatar.png'
import SidebarHeader from './SidebarHeader';
import { useState, useEffect } from 'react';

export default function ProfileSidebar({ setActiveView }) {
  const [userId, setUserId] = useState(null);

  // Use effect to safely access localStorage after mount
  useEffect(() => {
    const storedUserRaw = localStorage.getItem('user');
    if (storedUserRaw && storedUserRaw !== 'undefined') {
      try {
        const parsed = JSON.parse(storedUserRaw);
        if (parsed?._id) setUserId(parsed._id);
      } catch (err) {
        console.error('Failed to parse stored user:', err);
      }
    }
  }, []);

  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false) //toggle btw editing page or not
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [profileImage, setProfileImage] = useState(Avatar)
  const [selectedFile, setSelectedFile] = useState(null)

  //Debug
  // console.log('storedUser:', storedUser);
  // console.log('userId:', userId);

  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/users/${userId}`, {
          credentials: 'include',
        });
        const data = await res.json();
        console.log('Fetched user data:', data);
        setUser(data);
        setName(data.name || '');
        setUsername(data.username || '');
        setBio(data.bio || '');
        setProfileImage(data.profileImage ? `data:image/jpeg;base64,${data.profileImage}` : Avatar);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, [userId]);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('name', name)
    formData.append('username', username)
    formData.append('bio', bio)

    if (selectedFile) {
      formData.append('profileImage', selectedFile)
    }

     try {
      console.log('Parsed user ID:', userId);
      const response = await fetch(`http://localhost:4000/api/users/${userId}`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save changes.');
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);  // Show preview
      setSelectedFile(file);      // Attach to formData
    }
  };

  return (
    <div className="profile-sidebar p-6 text-white flex flex-col h-full w-full">
      <SidebarHeader
        subtitle="Profile Page"
        onBack={() => setActiveView('navigation')}
        user={user}
      />
      <div className="flex flex-col items-center w-full max-w-sm mx-auto mt-6">
        <img
          src={profileImage}
          alt="Profile"
          className="w-24 h-24 rounded-full mb-3 object-cover shadow-lg"
        />
        {isEditing && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-4 text-sm text-gray-200 block mx-auto"
          />
        )}
        {user ? (
          <>
            <p className="text-sm text-gray-300 mb-2">Email: {user.email}</p>
            <div className="w-full text-center mb-3">
              <label className="text-sm font-semibold mb-1 block">Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded text-black"
                />
              ) : (
                <p>{name}</p>
              )}
            </div>
            <div className="w-full text-center mb-3">
              <label className="text-sm font-semibold mb-1 block">Username:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded text-black"
                />
              ) : (
                <p>{username}</p>
              )}
            </div>
            <div className="w-full text-center">
              <label className="text-sm font-semibold mb-1 block">Bio:</label>
              {isEditing ? (
                <>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows="4"
                    className="w-full p-2 rounded text-black"
                  />
                  <button
                    onClick={handleSave}
                    className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-300">{bio}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-300">Loading...</p>
        )}
      </div>
    </div>
  );
}
