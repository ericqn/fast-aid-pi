curl -X POST http://localhost:8000/api/auth/login -H 'Content-Type: application/json' -d '{"email" : "john.doe@example.com", "password" : "password123"}'
python -c "print('\n')"
curl -X GET http://localhost:8000/api/auth/me -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJwYXRpZW50IiwiZXhwIjoxNzYxNTAzMDk5fQ.Ucf6jGXClvFUmqN5UWRKMFzeNgBprs_yxBEZ3oOpCDk'
python -c "print('\n')"
curl -X GET http://localhost:8000/api/conversations?limit=5 -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJwYXRpZW50IiwiZXhwIjoxNzYxNTAzMDk5fQ.Ucf6jGXClvFUmqN5UWRKMFzeNgBprs_yxBEZ3oOpCDk'
python -c "print('\n')"
curl -X GET http://localhost:8000/api/conversations/2ae5d653-61ff-4ced-98c6-6fa965f45f1c -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJwYXRpZW50IiwiZXhwIjoxNzYxNTAzMDk5fQ.Ucf6jGXClvFUmqN5UWRKMFzeNgBprs_yxBEZ3oOpCDk'
python -c "print('\n')"
curl -X GET http://localhost:8000/api/conversations/2ae5d653-61ff-4ced-98c6-oogabooga456 -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJwYXRpZW50IiwiZXhwIjoxNzYxNTAzMDk5fQ.Ucf6jGXClvFUmqN5UWRKMFzeNgBprs_yxBEZ3oOpCDk'
curl -X GET