#!/bin/bash
npx serve -p 3000 &
SERVER_PID=$!
sleep 2
open "http://localhost:3000/?q=ppc-performance-marketing"
wait $SERVER_PID
