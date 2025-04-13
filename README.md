Step 1: Download FFmpeg
Go to the official website:
👉 https://ffmpeg.org/download.html

Under the Windows section, click:

Windows builds from gyan.dev

On the next page, click:

ffmpeg-release-essentials.zip (usually under the "Release builds")

🗂 Step 2: Extract the ZIP File
Once downloaded, extract the .zip file using any extractor (e.g., WinRAR or built-in).

You will get a folder named something like:

Copy
Edit
ffmpeg-6.x-full_build/
Rename it (optional) to just ffmpeg for ease.

📁 Step 3: Move the Folder
Move the ffmpeg folder to a stable location, e.g.:

makefile
Copy
Edit
C:\ffmpeg
⚙ Step 4: Add FFmpeg to System Path
Press Win + S, type Environment Variables, and open:

Edit the system environment variables

In the System Properties window, click:

Environment Variables

Under System variables, scroll to find Path, then click:

Edit

Click New, and add the path to the /bin directory:

makefile
Copy
Edit
C:\ffmpeg\bin
Click OK to close all windows.

🧪 Step 5: Verify Installation
Open Command Prompt.

Type:

nginx
Copy
Edit
ffmpeg -version
You should see FFmpeg version info if everything was successful.
