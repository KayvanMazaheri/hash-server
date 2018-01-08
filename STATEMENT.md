# Information Technology Engineering: Web Programming Project 

The project is about two main concepts: Network and Cryptographic programming. The problem is about developing entities communicating over network. There are 2 main entities, Client and Server, talking to each other.  

- Adding any other entity based on design requirements is acceptable as far as well documentation provided.

## 1. Preliminaries:
Both Client and Server have a pair of asymmetric keys, so they should be able to carry out asymmetric cryptographic functions. These two entities should communicate over a socket connection (not web service).
## 2. The Overall Scenario:
1. The client sends a register request to the server and server must reply this request. At the end of registration process, server should have access to the client’s username, password and public key. Moreover, client needs to know the server's public key.
2. The client sends its username and password along (inside) a request for hashing a value (user input) to the server. The value should be sent encrypted in a way that only the server can decrypt.
3. Server computes the hash of that value and then sends the result to the client. The result should be sent encrypted in a way that only the client can decrypt.
4. After a successful cycle, client will send a "Thank You" message to the server as a sign of connection termination.
## 3. Non-functional Requirements:

You are free to choose any programming language but we recommend Java. You should use **SHA256** as Hash algorithm and **RSA (key length=1024)**, as asymmetric cryptographic algorithm.  
- **Hint: The Client should receive base64 representation of hash result.**. 

## 4. Deliverables:  

- ❖ Client code and executable artifact  
- ❖ Server code and executable artifact  
- ❖ A pdf file explaining everything ;)  


- **Notice about deliverables:**
  + Please deliver all files in a single zip file with the following name: **"student#_name.zip"**.
  + Executable artifacts should involve any dependency they need to run just by one click.
- **Document must:**
  + ✓ Explain the data flow and logic of your programs.
  + ✓ Be clear, Precise and BRIEF
  + ✓ Explain your overall design
  + ✓ Explain structure of messages
  + ✓ Explain new ideas or changes you considered
  + ✓ Include Any other information you think is helpful

## 5. Deadlines:
You should upload the **zip** file before **23:00** on **Dey 25th (96/10/25)**.  
You need also to present your results. The schedule of project presentation will be defined on Dey 26th. So be ready for presenting your work on **Dey 27th**. For presenting sooner than Dey 27th, feel free to contact us.

## 6. Presentation Day test scenario:

1. Running the Server
2. Running the Client
3. Enter username, password to the client program (terminal or GUI) as input for register process
4. Check register process
5. Close the client safely
6. Run the client again
7. Entering wrong username/password and a value to the client’s terminal (or GUI) for requesting a hash operating from the server
8. Checking the result for wrong password
9. Repeating step 7 with valid data
10. Checking the results
11. Checking bonus functionalities

## 7. Bonus:
**If you managed to address the requirements listed below, you are subject to getting bonus score (Documentation is required).**  

+ Supporting more than one Client simultaneously 
+ Client Authentication without password
+ Replay attack avoidance
+ Adding integrity to whole or a part of the communication cycle  

Feel free to contact TA if you have any question or concern. 
