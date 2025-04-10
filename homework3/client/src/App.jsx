import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
  });
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/events");
        setEvents(res.data);

        if (window.google && window.google.maps) {
          initMap(res.data);
        } else {
          console.error("Google Maps API not loaded.");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const initMap = (events) => {
    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 47.1585, lng: 27.6014 },
      zoom: 12,
    });

    const geocoder = new window.google.maps.Geocoder();

    events.forEach((event) => {
      if (event.location) {
        geocoder.geocode({ address: event.location }, (results, status) => {
          if (status === "OK" && results[0]) {
            const marker = new window.google.maps.Marker({
              map,
              position: results[0].geometry.location,
              title: event.title,
            });

            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <strong>${event.title}</strong><br/>
                ${event.description}<br/>
                ${new Date(event.date).toLocaleString()}<br/>
                <em>${event.location}</em>
              `,
            });

            marker.addListener("click", () => {
              infoWindow.open(map, marker);
            });
          } else {
            console.error("The location could not be geocoded::", event.location);
          }
        });
      }
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginForm.username && loginForm.password) {
      setIsLoggedIn(true);
      alert("Login successful!");
    } else {
      alert("Please fill in both fields.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = null;
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const uploadRes = await axios.post("http://localhost:8080/api/upload", formData);
        imageUrl = uploadRes.data.imageUrl;
      } catch (error) {
        console.error("Error uploading the image", error);
      }
    }

    try {
      const eventRes = await axios.post("http://localhost:8080/api/events", {
        ...form,
        imageUrl,
      });

      if (eventRes.data.id) {
        alert("Event created successfully");
        fileInputRef.current.value = "";
        setForm({ title: "", description: "", date: "", location: "" });
        setFile(null);
        const newEvents = await axios.get("http://localhost:8080/api/events");
        setEvents(newEvents.data);
        initMap(newEvents.data);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("There was a problem creating the event.");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {isLoggedIn ? (
        <>
          <h1 className="text-3xl font-bold mb-4">📅 EventRadar</h1>

          <form onSubmit={handleSubmit} className="mb-6 space-y-2">
            <input
              className="w-full p-2 border rounded"
              type="text"
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              required
            />
            <textarea
              className="w-full p-2 border rounded"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              required
            />
            <input
              className="w-full p-2 border rounded"
              type="datetime-local"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
            <input
              className="w-full p-2 border rounded"
              type="text"
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              required
            />
            <input
              className="w-full p-2 border rounded"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create Event
            </button>
          </form>

          <div id="map" className="w-full h-64 mb-6 border rounded"></div>

          <ul className="space-y-4">
            {events.map((event) => (
              <li key={event.id} className="p-4 border rounded">
                <h2 className="text-xl font-semibold">{event.title}</h2>
                <p>{event.description}</p>
                <small>{new Date(event.date).toLocaleString()}</small>
                <p className="italic">{event.location}</p>
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt="event"
                    className="mt-2 max-w-full h-auto rounded"
                  />
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="p-4 max-w-sm mx-auto">
          <h1 className="text-3xl font-bold mb-4">Login</h1>

          <form onSubmit={handleLoginSubmit} className="mb-6 space-y-2">
            <input
              className="w-full p-2 border rounded"
              type="text"
              name="username"
              placeholder="Username"
              value={loginForm.username}
              onChange={handleLoginChange}
              required
            />
            <input
              className="w-full p-2 border rounded"
              type="password"
              name="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={handleLoginChange}
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Log In
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
