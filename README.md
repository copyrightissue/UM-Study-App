# Study Buddy!

![CI/CD](https://github.com/WesleeS/UM-Study-App/actions/workflows/test.yml/badge.svg)

Kenneth, Bethany, Jake - **Front End**  
Aaron, Cass - **Backend**  
Gavin, Tim - **QA Testing**  
Chris - **DevOPs**  
Weslee - **Lead**  

# Problem Statement
The problem we aim to solve with software is helping students study better. We aim to achieve this through the development of collaborative notes, scheduled meetings, and functional rating systems all supervised by teachers.

# Target Users 
The target users are students, professors, and TAs. 

# Key Feature
Key Feature 1: A calendar where users can post their availability and view other users' availability. Potentially, scheduling may happen in the calendar as well.

Key Feature 2: A forum for students, professors, and TAs to chat.

Key Feature 3: An assignment and exam tracker that shows upcoming work. 

Key Feature 4: An option to make flashcards.

Key Feature 5: An option for notesharing.

# Excel Sheet
This includes our Requirement Specifications, Use Cases, RACI matrix, and Class Activities. 
[Click here to view Excel Sheet](https://umconnectumt-my.sharepoint.com/:x:/g/personal/co203478_umconnect_umt_edu/ERfprmCjOOVGu49aVgMHzZoBoFenHxLvq8Huw3K23HaogQ?e=cNGKJi) 

# Additonal notes for development: 
Each student should: 
- Contain attributes that declare their **enrolled courses**, or courses they have a relation to (e.g., Instructor/TA access). This specifies what events they can either **create or join on the calender.**
- **Post on message boards** or forum pages, such as to request help (without a dedicated study session), share notes, or discuss class topics in general.

Events are:
- **Created by students** (to be more proactive), and **affirmed by other students or verified by Instructor/TA**.
- Relate to a **specific course** (e.g., "Exam for CSCI###").
- **Aggregate student availability** based on freetime, allowing better setup and arrangement of study sessions by users.

