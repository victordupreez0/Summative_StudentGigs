<div align="center">
  
# StudentGigs

> A full-stack marketplace platform connecting students with freelance opportunities and gig work.


**Live Demo:** [studentgigs.xyz](https://studentgigs.xyz)

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Heroku](https://img.shields.io/badge/heroku-%23430098.svg?style=for-the-badge&logo=heroku&logoColor=white)

</div>

---

## Table of Contents

- [About the Project](#about-the-project)
  - [Project Description](#project-description)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [How to Install](#how-to-install)
- [Features and Functionality](#features-and-functionality)
- [Concept Process](#concept-process)
  - [Ideation](#ideation)
  - [Wireframes](#wireframes)
  - [User Flow](#user-flow)
- [Development Process](#development-process)
  - [Implementation Process](#implementation-process)
  - [Highlights](#highlights)
  - [Challenges](#challenges)
- [Reviews and Testing](#reviews-and-testing)
  - [Feedback from Reviews](#feedback-from-reviews)
  - [Unit Tests](#unit-tests)
- [Future Implementation](#future-implementation)
- [Final Outcome](#final-outcome)
  - [Mockups](#mockups)
  - [Video Demonstration](#video-demonstration)
- [Conclusion](#conclusion)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

---

## About the Project

### Project Description

StudentGigs is a comprehensive web application designed to connect students with flexible work opportunities. The platform handles the complete job lifecycle including posting, applications, interviews, messaging, and reviews. Built with modern web technologies, it provides a seamless experience for both students seeking gigs and employers looking to hire talented students.

### Built With

* ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=white) - React 18 with hooks and context
* ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) - Fast build tool and dev server
* ![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) - Utility-first CSS framework
* ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) - JavaScript runtime
* ![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white) - Web framework
* ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white) - Relational database
* ![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) - Token-based authentication

---

## Getting Started

The following instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure that you have the latest version of Node.js and MySQL installed on your machine.
```bash
node --version  # v14.0.0 or higher
npm --version   # v6.0.0 or higher
mysql --version # v8.0 or higher
```

### How to Install

#### Clone Repository

Run the following in the command-line to clone the project:
```bash
git clone https://github.com/victordupreez0/Summative_StudentGigs.git
cd Summative_StudentGigs
```

#### Install Dependencies

Run the following in the command-line to install all the required dependencies:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
cd ..
```

#### Set up MySQL Database

Create a new database (or let the app create it automatically):
```sql
CREATE DATABASE studentgigs;
```

The application will automatically create all required tables on first run.

#### Configure Database Connection (Optional)

The application uses these default values for local MySQL:
- Host: 127.0.0.1
- Port: 3306
- User: root
- Password: (empty)
- Database: studentgigs

If your MySQL setup is different, you can create a `.env` file in the backend directory:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=studentgigs
```

#### Start the Development Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### Access the Application

Open your browser and navigate to: `http://localhost:5173`

The backend API will be running on: `http://localhost:4000`

---

## Features and Functionality

### Authentication & Authorization
![Feature Image](image2)

JWT-based secure authentication with role-based access control for Students, Employers, and Admins. Protected routes and API endpoints ensure secure access throughout the platform.

### Job Management
![Feature Image](image3)

Create, edit, and manage job postings with advanced search and filtering capabilities. Category-based organization with budget tracking for both hourly and fixed rates.

### Application System
![Feature Image](image4)

Apply to jobs with cover letters and portfolio links. Track application status, schedule interviews, and receive feedback throughout the process.

### Communication & Reviews
![Feature Image](image5)

Real-time messaging between users with notification system. Bilateral review system with star ratings and written feedback for reputation building.

---

## Concept Process

The Conceptual Process is the set of actions, activities and research that was done when starting this project.

### Ideation

![Ideation](image5)
![Ideation](image6)

The ideation phase focused on identifying the gap in the student job market and creating a platform that would streamline the connection between students and employers. Research was conducted on existing freelance platforms to understand pain points and opportunities for improvement.

### Wireframes

![Wireframes](image7)

Wireframes were created to map out the user interface and ensure an intuitive flow for both students and employers. Key screens included job browsing, application submission, messaging, and dashboard views.

### User Flow

![User Flow](image8)

The user flow diagram illustrates the complete journey from registration through job discovery, application, communication, and review completion. Separate flows were designed for student and employer experiences.

---

## Development Process

The Development Process is the technical implementations and functionality done in the frontend and backend of the application.

### Implementation Process

* **RESTful API Architecture** - Implemented Express.js backend with organized controller and route structure for scalable API development
* **JWT Authentication** - Secure token-based authentication system with protected routes and middleware
* **React Context API** - Centralized state management for user authentication and global app state
* **MySQL Database Design** - Relational database with normalized tables for users, jobs, applications, messages, and reviews
* **Component-Based UI** - Reusable React components with shadcn/ui for consistent design system
* **Real-time Features** - Messaging system with conversation threading and notification handling
* **SEO Optimization** - Implemented meta tags, structured data, sitemap.xml, and robots.txt for search engine visibility

### Highlights

* **Seamless User Experience** - Intuitive interface that makes job discovery and application process effortless for students
* **Robust Authentication** - Secure JWT implementation with role-based access control
* **Real-time Communication** - Messaging system enables direct connection between students and employers
* **Comprehensive Dashboard** - Users can track all their activities in one centralized location
* **Performance Optimization** - Fast load times with Vite build tool and efficient database queries
* **Localization** - South African Rand (ZAR) currency support with proper formatting

### Challenges

* **Database Connection Pooling** - Managing MySQL connections efficiently required implementing connection pooling to handle concurrent requests
* **State Management Complexity** - Coordinating authentication state across protected routes and API calls required careful context design
* **Real-time Messaging** - Implementing a reliable messaging system without WebSockets required polling strategies and careful state updates
* **Cross-Origin Resource Sharing** - Configuring CORS properly for development and production environments
* **File Upload Handling** - Managing profile pictures and resume uploads with proper validation and storage

---

## Reviews and Testing

### Feedback from Reviews

Peer Reviews were conducted by fellow students and lecturer. The following feedback was found useful:

* **Improve Mobile Responsiveness** - Several screens needed better mobile optimization, particularly the dashboard and messaging interface
* **Enhanced Search Functionality** - Users requested more filtering options and the ability to save searches
* **Notification System** - Feedback suggested adding email notifications for important events like application status changes
* **Portfolio Integration** - Students wanted better ways to showcase their work within their profiles

### Unit Tests

Unit Tests were conducted to establish working functionality. Here are all the tests that were run:

* **Authentication Flow** - Testing user registration, login, token generation, and protected route access
* **Job CRUD Operations** - Testing create, read, update, and delete functionality for job postings
* **Application Submission** - Testing the complete application flow from submission to status updates
* **Messaging System** - Testing message sending, conversation retrieval, and read status updates
* **Database Queries** - Testing all SQL queries for proper results and handling edge cases

---

## Future Implementation

* **WebSocket Integration** - Implement real-time messaging using Socket.io for instant communication
* **Payment Integration** - Add Stripe/PayPal integration for secure payment processing
* **Advanced Analytics** - Employer dashboard with detailed analytics on job performance and applicant insights
* **Mobile Application** - Develop native iOS and Android apps using React Native
* **AI-Powered Matching** - Implement machine learning algorithms to match students with relevant jobs
* **Video Interviews** - Integrate video calling functionality for remote interviews
* **Skill Verification** - Add certification and skill verification system
* **Email Notifications** - Complete email notification system for all major events

---

## Final Outcome

### Mockups

<img src="https://github.com/user-attachments/assets/e255e4bc-5dce-4afa-b517-169050fc6d3c" alt="StudentGigs Mockup 1" width="800"/>

<img src="https://github.com/user-attachments/assets/1377c44a-8a4e-4825-9426-ee5014c8efd6" alt="StudentGigs Mockup 2" width="800"/>

### Video Demonstration

To see a run through of the application, click below:

[View Demonstration](https://drive.google.com/file/d/1bg0EgrScTQsC_hhLZr84fIuw3z3930fP/view?usp=sharing)

## Conclusion

StudentGigs successfully bridges the gap between students seeking flexible work and employers looking for talented help. The platform provides a complete solution for the freelance gig economy with robust features including authentication, job management, applications, messaging, and reviews. Built with modern technologies and best practices, the application is scalable, secure, and user-friendly.

---

## Roadmap

See the [open issues](https://github.com/victordupreez0/Summative_StudentGigs/issues) for a list of proposed features (and known issues).

---

## Contributing

Contributions are what makes the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Authors

**Victor du Preez** - [victordupreez0](https://github.com/victordupreez0)

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contact

**Victor du Preez**
* Email: 
* GitHub: [@victordupreez0](https://github.com/victordupreez0)
* Project Link: [https://github.com/victordupreez0/Summative_StudentGigs](https://github.com/victordupreez0/Summative_StudentGigs)

---

## Acknowledgements

* [React Documentation](https://react.dev/)
* [Node.js Documentation](https://nodejs.org/)
* [Express.js Documentation](https://expressjs.com/)
* [MySQL Documentation](https://dev.mysql.com/doc/)
* [TailwindCSS Documentation](https://tailwindcss.com/)
* [shadcn/ui Components](https://ui.shadcn.com/)
* [Vite Documentation](https://vitejs.dev/)
