<div align="center">

# 🛡️ S.H.I.E.L.D
**Security Heuristic Intelligence & Event Logging Dashboard**


<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" />
</p>

<h3>Advanced SOC-style platform for Security Analysis, Threat Simulation, and Real-time Monitoring.</h3>


</div>

## � Project Overview

**S.H.I.E.L.D**  is a lightweight yet powerful platform designed to bridge the gap between theoretical cybersecurity knowledge and practical application.

It simulates a realistic SOC (Security Operations Center) environment which can:
1.  **Attack**: Launch simulated cyber-attacks (SQLi, XSS, Brute-force).
2.  **Monitor**: Watch the attacks be detected in real-time.
3.  **Analyze**: Investigate incidents using an AI-powered Chatbot.
4.  **Defend**: Implement blocks and countermeasures.

> **Team Diamonds**: Built with ❤️ for developers, students, and security enthusiasts.

---


📝 Problem Statement (PS Number 6)

The Morphin Grid is under attack by the Cyber Kaiju, which floods the system with rapid, mutating intrusions. The old security modules are failing, allowing suspicious activities to slip past and rogue packets to penetrate the weak firewall, leaving the team without a single, centralized place to monitor incidents.
The project objective is to design and implement a mini Security Operations Center system (the MicroSOC Command Center) that can:

-Simulate real-time cyber attacks.

-Process and categorize threats.

-Allow analysts to view incidents.

-Provide essential, actionable dashboards.

## ✅ Functionality Checklist

Here is a summary of how S.H.I.E.L.D meets the project requirements:

### Phase 1: Basic Functionalities (Must-Have)
- [x] **Authentication & Access**: Secure login with JWT & RBAC (Admin/Analyst roles).
- [x] **Log Ingestion**: Continuous auto-generated logs for XSS, SQLi.
- [x] **Threat Classification Engine**: Rule-driven analysis prioritizing high-risk patterns.
- [x] **Incident Management**: Full lifecycle tracking (Open -> Resolved) with assignment.
- [x] **Dashboards**: Real-time visualization of attack trends and severity distribution.

### Phase 2: Advanced Functionalities
- [x] **Real-time Pattern Detection**: Anomaly spikes detected via threshold logic.
- [x] **Continuous Live Streaming**: WebSocket integration for instant log updates.
- [x] **Geo-mapped Attack Visualization**: Interactive map showing attacker origins.
- [x] **Automated Remediation**: One-click IP blocking and incident resolution.

### Phase 3: Brownie Points
- [x] **Redis Caching**: Integrated for high-performance data retrieval.
- [x] **Worker Queue**: Async processing for log analysis.




##  Key Features Explained

### 1.  Real-Time Threat Intelligence Dashboard
**What it does:** Provides a live, bird's-eye view of your network's security status.
*   **Live Geomap**: Visualizes attacks as they happen on an interactive world map, drawing lines from attacker countries to your servers.
*   **Instant Updates**: Powered by WebSockets, you see new logs and incidents appear instantly—no page refreshes needed.
*   **Key Metrics**: Tracks critical stats like "Attacks per Minute", "Top Attacker IPs", and "Severity Distribution" to help you prioritize.

### 2.  Active Traffic Monitoring & Pre-emptive Shielding
**What it does:** The "First Line of Defense" that inspects traffic *before* it reaches your database.
*   **Deep Packet Inspection**: Analyzes every incoming HTTP request (Body, Query, Headers) used for `SQLi`, `XSS`, and `RCE` signatures.
*   **Pre-Processing Detection**: Unlike traditional logging, this system detects threats **before** the request is processed.
    *   **SQL Injection**: Blocks payload like `' OR '1'='1` instantly.
    *   **XSS**: Intercepts malicious scripts like `<script>alert(1)</script>`.
    *   **RCE**: Stops command injection attempts like `; cat /etc/passwd`.
*   **Zero-Latency Blocking**: Malicious requests are terminated immediately with a `403 Forbidden` response, protecting the system from executing harmful code.

### 3.  Intelligent Incident Management
**What it does:** Turns chaos into order by grouping raw logs into structured "Incidents".
*   **Automated Triage**: The system automatically flags high-risk activities (like Brute Force attempts) and creates an Incident ticket.
*   **Lifecycle Tracking**: Move incidents through a professional workflow: `OPEN` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED`.
*   **Analyst Notes**: A collaborative notepad for every incident where analysts can log findings, evidence, and actions taken suitable for post-mortem reports.

### 4.  Automated Defense & Auto-Resolve
**What it does:** Empowers Admins to take immediate action against threats.
*   **One-Click Block**: Admins can block a malicious IP address directly from the Incident console.
*   **Auto-Resolve**: With a single click, the system can **Block the IP**, **Close the Incident**, and **Update the Status** simultaneously, saving valuable time during an attack.
*   **Blocklist Management**: A dedicated interface to view and manage active IP bans.

### 5.  AI Security Assistant (RAG Chatbot)
**What it does:** Your personal AI security expert, available 24/7.
*   **Context-Aware**: Ask questions like *"What happened with IP 45.33.22.11?"* and the AI will analyze the logs and explain the attack in plain English.
*   **Knowledge Base**: Retrieves information from your specific security logs and predefined rules to give accurate, relevant answers (Retrieval-Augmented Generation).

### 6.  Red-Team Attack Simulation
**What it does:** built-in "hacker" module to test your defenses.
*   **Scenario Generator**: Simulate real-world attacks like **SQL Injection**, **Cross-Site Scripting (XSS)**, and **Brute Force** credential stuffing.
*   **Training Tool**: perfect for training new analysts on how to spot and respond to specific attack signatures in a controlled environment.

### 7.  Secure Role-Based Access (RBAC)
**What it does:** Ensures the right people have the right access.
*   **Analyst Role**: Focused on investigation. Can view logs, use the AI chat, and update incidents assigned to them.
*   **Admin Role**: Full control. Can manage users, block IPs, resolve incidents, and configure system settings.


# Tech Stack: 
### 🖥️ Frontend (Client-Side)
*   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) - Lightning fast build tool and latest React features.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling for premium responsive designs.
*   **State Management & Routing**: Context API + React Router DOM v7.
*   **Real-time Config**: `socket.io-client` for handling live events.
*   **Data Visualization**:
    *   [Recharts](https://recharts.org/) - For attack trends, severity distribution, and analytics.
    *   [React Simple Maps](https://www.react-simple-maps.io/) + `d3-scale` - For the interactive Geomap.
*   **UI Components**: [Lucide React](https://lucide.dev/) (Icons), [React Toastify](https://fkhadra.github.io/react-toastify/) (Notifications).
*   **Utilities**: `axios` (API requests).

### ⚙️ Backend (Server-Side)
*   **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) - Robust REST API architecture.
*   **Database**: [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) - Schema-based data modeling.
*   **Real-time Engine**: [Socket.io](https://socket.io/) - Bi-directional communication for instant updates.
*   **Security**:
    *   `bcryptjs` - Password hashing.
    *   `jsonwebtoken` (JWT) - Secure session handling.
    *   `cors` - Cross-Origin Resource Sharing management.
*   **AI Integration**: [`@google/generative-ai`](https://www.npmjs.com/package/@google/generative-ai) - Interfacing with Gemini Pro.
*   **Utilities**:
    *   `geoip-lite` - IP-to-Location resolution for threat mapping.
    *   `nodemailer` - Email notifications (alerts).
    *   `cloudinary` / `multer` - File handling.
    *   `ioredis` - High-performance caching (optional/planned).

## 😎 System Architecture / High-level design
The following diagrams illustrate the core flow of the S.H.I.E.L.D ecosystem.
<img width="1227" height="788" alt="image" src="https://github.com/user-attachments/assets/fa66a8fb-b29a-49f3-a3de-b826ef29f215" />
<img width="1227" height="788" alt="image" src="https://github.com/user-attachments/assets/6d901016-87fb-4214-a50a-b804e4556769" />
<img width="1227" height="788" alt="image" src="https://github.com/user-attachments/assets/9cca97e6-77af-45f4-943f-ceb098b85483" />

## 🔌 API Documentation

### 1. 🔐 Authentication
Base Path: `/api/v1/auth`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/register/analyst` | Register a new Analyst | Public |
| `POST` | `/register/admin` | Register a new Admin | Public |
| `POST` | `/login` | Login with Email/Password | Public |
| `POST` | `/google-login` | Login with Google | Public |
| `POST` | `/google-register` | Register with Google | Public |
| `POST` | `/refresh-token` | Refresh Access Token | Public |
| `POST` | `/logout` | Logout user | Protected |
| `GET` | `/me` | Get current user info | Protected |
| `GET` | `/verify` | Check token validity | Public |

### 2. 📝 Logs & Intelligence
Base Path: `/api/v1/logs`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | **Ingest**: Receive log from Attacker | Public |
| `GET` | `/` | **List**: Get logs with checks/filters | Analyst/Admin |
| `GET` | `/stats` | **Stats**: Aggregated security metrics | Analyst/Admin |

### 3. 🚨 Incident Management
Base Path: `/api/v1/incidents`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List Incidents | Protected |
| `GET` | `/:id` | Get Incident Details | Protected |
| `PATCH` | `/:id` | Triage (Status/Severity) | Analyst/Admin |
| `POST` | `/:id/assign` | Assign to Analyst | Analyst/Admin |
| `POST` | `/:id/unassign` | Unassign Analyst | Analyst/Admin |
| `POST` | `/:id/request-assignment` | Request to work on incident | Analyst |

### 4. 🛡️ Admin Core Operations
Base Path: `/api/v1/admin`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | System Health Check | Admin |
| `GET` | `/assignment-requests` | View pending assignment requests | Admin |
| `POST` | `/assignment-request/:id/handle` | Approve/Reject assignment | Admin |
| `GET` | `/incidents` | **Admin Feed**: Full incident access | Admin |
| `PATCH` | `/incidents/:id` | **Manage**: Status, Severity, Notes | Admin |
| `POST` | `/incidents/:id/resolve` | **Auto-Resolve**: Block IP & Close | Admin |

### 5. 🛠️ Admin Modules
Base Paths: `/api/v1/admin/...`

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Blocklist** | `GET` | `/blocklist` | List blocked IPs |
| **Blocklist** | `POST` | `/blocklist` | Block an IP manually |
| **Blocklist** | `DELETE` | `/blocklist/:id` | Unblock an IP |
| **Users** | `GET` | `/users` | List all system users |
| **Users** | `POST` | `/users` | Create a user manually |
| **Users** | `DELETE` | `/users/:id` | Delete a user |
| **Knowledge** | `GET` | `/knowledge` | List RAG Knowledge Base |
| **Knowledge** | `POST` | `/knowledge` | Add RAG Context Chunk |
| **Knowledge** | `DELETE` | `/knowledge/:id` | Remove Context Chunk |

### 6. 🤖 AI & Chatbot
Base Paths: `/api/v1/ai` & `/api/v1/chat`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/chat` | **General Chat**: RAG-enhanced Q&A | Protected |
| `POST` | `/ai/incident-chat` | **Incident Chat**: Context-aware analysis | Protected |
| `DELETE` | `/ai/history` | Clear chat history | Protected |

### 7. 👤 User Profiles
Base Paths: `/api/v1/analyst/profile` & `/api/v1/admin/profile`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Get Profile Details | Owner |
| `PUT` | `/` | Update Profile Info | Owner |
| `PUT` | `/image` | Update Profile Picture | Owner |
| `PUT` | `/password` | Change Password | Owner |
| `POST` | `/resend-verification` | Resend Email Verify Link | Owner |




## 🛠️ Setup & Installation

Follow these steps to deploy S.H.I.E.L.D locally.

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Running locally or Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/shield-project.git
cd shield-project
```

### 2. Backend Configuration
Navigate to the backend directory and install dependencies:
```bash
cd WebApplication/Backend
npm install
```

Create a `.env` file in `WebApplication/Backend` with the following variables:
```env
PORT=8000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net
CORS_ORIGIN=http://localhost:5173

# Cloudinary (File Uploads)
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# Google Auth
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
GOOGLE_CALLBACK_URL=http://localhost:5173/google/callback

# Security & Tokens
ACCESS_TOKEN_SECRET=<generated_secret_key>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<generated_refresh_secret>
REFRESH_TOKEN_EXPIRY=10d
JWT_SECRET=<your_jwt_secret>

# Email Service
EMAIL_USER=<your_email_address>
EMAIL_PASS=<your_app_password>
CLIENT_URL=http://localhost:5173

# AI Integration
GEMINI_API_KEYS=<key1>,<key2>,<key3>

# Redis (Optional)
REDIS_URI=redis://:<password>@<host>:<port>
```
*Note: Replace `<placeholder>` values with your actual credentials.*

Start the backend server:
```bash
npm run dev
```

### 3. Dashboard (Frontend) Setup
Navigate to the frontend directory and install dependencies:
```bash
cd ../Frontend
npm install
```

Create a `.env` file in `WebApplication/Frontend` with the following variables:
```env
VITE_SERVER=http://localhost:8000/api/v1
VITE_GOOGLE_CALLBACK_URL=http://localhost:5173/google/callback
VITE_GOOGLE_CLIENT_ID=<your_google_client_id>
```

Start the frontend dashboard:
```bash
npm run dev
# Accessible at http://localhost:5173
```

### 4. Attacker Simulator Setup
```bash
cd ../../Attacker/frontend
npm install
npm run dev
# Accessible at http://localhost:5174
```

<h2>📸 Screenshots of Working Features</h2>

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/f609ea6e-f631-48c3-b02f-f17c7c3f80b4" width="500"/></td>
    <td><img src="https://github.com/user-attachments/assets/9f389175-2754-461e-9765-ccb9e506e26f" width="500"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/98d64ce7-94f3-4cb6-a4c0-7f37302e8a38" width="500"/></td>
    <td><img src="https://github.com/user-attachments/assets/f24b2165-b60f-4afd-9311-265a093bbe1f" width="500"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/8e0aeec6-c77d-4d3a-8723-643f677648d9" width="500"/></td>
    <td><img src="https://github.com/user-attachments/assets/13fa0e5b-5f44-4a54-8748-485310cb357e" width="500"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/2e990d70-9e33-4a26-b78c-cc48e70cd059" width="500"/></td>
    <td><img src="https://github.com/user-attachments/assets/a9499b20-a5e6-4279-a794-ef2712667c38" width="500"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/a2e90bef-34bf-4333-9bf4-c823e53351d1" width="500"/></td>
    <td><img src="https://github.com/user-attachments/assets/af6b2177-b8d3-4f7c-93b4-9a4fab1e3cb2" width="500"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/0a4f33a3-44f2-4b21-9b7c-e0309d67098b" width="500"/></td>
    <td><img src="https://github.com/user-attachments/assets/b7e27bbe-0b1b-4b30-857a-477fc01f5583" width="500"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/14934dcd-20db-4364-8a28-0ac3d00c863a" width="500"/></td>
    <td><img src="https://github.com/user-attachments/assets/89e9377f-b7c3-4de9-a9a2-e4f1e1d15ae1" width="500"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/fbdcd6ff-d8a9-470f-89bb-d151982d1c89" width="500"/></td>
    <td><img src="https://github.com/user-attachments/assets/10dd071d-7288-4291-968d-e6eb56a55f35" width="500"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/39bc3baf-6c0f-4179-aca6-d7f616dd77c9" width="500"/></td>
    <td><img src="https://github.com/user-attachments/assets/d672b70d-ef99-403f-b445-7a9f536cf1b0" width="500"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/1997ef93-79a8-43e5-a3b5-acdaa3f88891" width="500"/></td>
    <td><img src="https://github.com/user-attachments/assets/6d2394c6-68ff-41a7-b8d0-b900b0bd43a4" width="500"/></td>
    
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/ef9a71fe-0186-4698-bd12-0d9761c3f220" width="500"/></td>
    <td><img src="https://github.com/user-attachments/assets/7a865785-2d24-4944-8cf3-14113371e56c" width="500"/></td>
  </tr>
</table>






## 🛡️ Error Handling & Reliability Considerations

S.H.I.E.L.D is built to withstand the chaotic nature of cyber-attacks. We prioritize system stability through:

### 1. Unified Error Management
*   **Global Error Middleware**: A centralized handler catches all exceptions (synchronous or asynchronous) from any route, ensuring the server *never* crashes due to an unhandled error.
*   **Standardized API Responses**: Every error follows a strict JSON structure (`success: false`, `message`, `statusCode`), allowing the frontend to gracefully display user-friendly alerts.
*   **Async Wrappers**: All database operations are wrapped in `asyncHandler` utilities to automatically forward promise rejections to the global handler.

### 2. Database & Connection Reliability
*   **Auto-Reconnect**: The MongoDB connection logic includes auto-retry mechanisms to handle transient network drops without manual intervention.
*   **Worker Queues**: Heavy log processing is offloaded to worker threads/queues (via BullMQ/Redis), ensuring the main event loop remains non-blocking even during high-traffic log detection.

### 3. Frontend Resilience
*   **Socket Reconnection**: The real-time dashboard automatically attempts to reconnect (`socket.io-client` heartbeat) if the backend server restarts or the network fluctuates.
*   **Graceful Degradation**: If the AI service (Gemini) is unreachable, the Chatbot switches to a "Offline Mode" or alerts the user, while core monitoring features remain fully functional.
*   **Session Persistence**: JWT-based auth with silent refresh mechanisms ensures analysts aren't logged out unexpectedly during critical investigations.


## 🧠 AI/ML Integration: RAG-based Security Chatbot

S.H.I.E.L.D implements a **Retrieval-Augmented Generation (RAG)** architecture to provide analysts with intelligent, context-aware assistance.

### Tech Stack
*   **LLM**: Google Gemini 2.5 flash lite
*   **Vector Database**: MongoDB Atlas Vector Search (Integrated)
*   **Memory**: Redis (for maintaining conversation history)
*   **Embedding Model**: `text-embedding-004` (via Google Generative AI)

### 🔄 The "Complete Flow" (How it works)
When an analyst asks a question (e.g., *"Is this SQL Injection dangerous?"*), the system follows this pipeline:

1.  **Context Aggregation**:
    *   **Incident Data**: Fetches details of the *current* open incident (Severity, Source IP, Attack Type).
    *   **Live Logs**: Pulls the last 5 raw logs related to this incident to give the AI real-time evidence.
2.  **Vector Search (RAG)**:
    *   The user's question is converted into a vector embedding.
    *   The system searches the **Knowledge Base** (admin-uploaded security docs, playbooks) for the most relevant procedures using *Cosine Similarity*.
3.  **Prompt Engineering**:
    *   A massive "System Prompt" is dynamically constructed containing: `[Role: SOC Expert]` + `[Incident Details]` + `[Retrieved Docs]` + `[Chat History]`.
4.  **Generative Analysis**:
    *   Google Gemini processes this rich context and streams a professional response back to the frontend.
    *   It explains the threat, cites the internal playbook (found via RAG), and suggests specific remediation steps (e.g., "Block IP 192.168.x.x").
5.  **Memory loop**:
    *   The Q&A pair is stored in Redis so the AI remembers the conversation context for follow-up questions.


## � Team Members & Responsibilities

| Team Member | Role | Key Contributions |
| :--- | :--- | :--- |
| **Mridul** | **Team Leader** | 🧠 **Ideation & Theory**: Guided the project's conceptual backbone and theoretical framework. |
| **Vansh Saini** | **Lead Developer** | ⚙️ **Architecture & Core Engine**: Built the Backend structure, Monitoring Engine, Threat Logic, and both Dashboards. |
| **Anupam** | **Developer (Sim & QA)** | 🎭 **Simulation & Reliability**: Created the Attack Simulator, solved critical bugs, and contributed to full-stack integration. |
| **Deepak** | **Frontend Designer** | 🎨 **UI/UX & Design**: Designed the frontend interface and led discussions on implementation ideas. |


## �🛠 Future Roadmap

- [ ] **Containerization with Docker**: Fully containerize the backend, frontend, and database to simplify deployment, ensure environment consistency, and enable easy scaling.  

- [ ] **Advanced SIEM(Security Information and Event Management) Integration**: Streamline log forwarding to platforms like Splunk or Elasticsearch for centralized monitoring, deep analytics, and historical threat correlation.  

- [ ] **Automated Threat Response**: Introduce intelligent agents capable of detecting suspicious activity and taking automated defensive actions, such as IP blocking, alert escalation, or patching vulnerabilities.  

- [ ] **Multi-Organization Support**: Enable the platform to serve multiple clients with isolated dashboards, data segregation, and customizable access control, while maintaining a shared backend infrastructure.  

- [ ] **Enhanced Analytics & Reporting**: Implement predictive analytics and detailed reporting tools to identify emerging threat patterns and generate actionable insights for security teams.  

- [ ] **Scalable Real-Time Monitoring**: Optimize the system to handle higher log volumes and support multiple concurrent dashboards with near-zero latency updates.


<div align="center">


**Built by Team Diamonds** 💎
*Security simplified. Monitoring mastered.*

</div>
