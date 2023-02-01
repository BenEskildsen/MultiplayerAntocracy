Sidewalk Empire 2020

To run locally:

1. After making changes you want to play, run the command:
  > ./make
2. Start the local server:
  > npm start
3. in the browser, go to
   localhost:8000

To make and deploy changes:

1. Make changes
2. Update the version number in ui/Lobby
3. Test them!!
4. Pushing to prod will update the web version
  > ./commit "summary of changes"
  > git push -u origin prod
5. Build electron
  > npm run make
6. Test the electron build
7. Deploy electron to itch
8. Also want to build the electron on windows by
   running the same command on a windows machine
