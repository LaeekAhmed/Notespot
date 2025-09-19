# Notespot

An **over engineered** file management platform with an cloud native Express based API server and a custom Next.js frontend, designed for users to upload, download, and publicly share files of various formats (PDFs, docs, images and more).

Built with a focus on learning **scalable cloud infrastructure** and **modern backend development practices**.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="sys-arch-dark-mode.png">
  <source media="(prefers-color-scheme: light)" srcset="sys-arch-light-mode.png">
  <img alt="Fallback image description" src="sys-arch-dark-mode.png">
</picture>

### **Architecture Overview**

- **Frontend**: Built with **Next.js**, deployed on **Vercel**, delivering a easy to use interface for users.
- **Backend**: Developed using **Express.js** and deployed on **AWS Lambda** using the Serverless Framework, providing a scalable cloud native **REST API**
- **Authentication**: Integrated **Clerk** for user authentication and API security, ensuring only authorized users can access and manipulate data.
- **File Storage**: Files are directly uploaded to **AWS S3** using presigned URLs, eliminating the need of passing through the API server, saving on bandwidth and latency.
- **Logging**: Logs are sent to **AWS CloudWatch**, enabling efficient monitoring and debugging of the application.
- **Database**: File metadata is stored in **MongoDB Atlas**, enabling efficient data management and fast querying.
