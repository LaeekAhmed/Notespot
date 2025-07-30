# Notespot

**Full-stack file sharing platform** designed for users to upload, download, and publicly share files of various formats (PDFs, docs, images, etc.), built with a focus on learning **scalable cloud infrastructure** and **modern backend development practices**.

### **Architecture Overview**

- **Frontend**: Built with **Next.js**, deployed on **Vercel**, delivering a easy to use interface for users.
- **Backend**: Developed using **Express.js** and deployed on an **AWS EC2 instance**, providing a minimal **REST API** to facilitate communication between the frontend and backend services.
- **Authentication**: Integrated **Clerk** for user authentication and API security, ensuring only authorized users can access and manipulate data.
- **File Storage**: Files are uploaded to **AWS S3**, leveraging the scalability and performance of Amazon’s cloud storage.
- **Database**: Metadata and related information is stored in **MongoDB Atlas**, enabling efficient data management and fast querying.


<img width="785" height="480" alt="image" src="https://github.com/user-attachments/assets/6b97bc96-e216-4547-ad3c-e3829d50ce1d" />


