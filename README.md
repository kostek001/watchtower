# Watchtower
Discord self-bot for saving user statuses in MySQL database.

## How to use
1. Create MySQL database with tables:
    - `names` - `USER_ID`, `USERNAME`
    - `status` - 
2. Make `.env` file with:
    ```env
    DB_HOST: <hostname or ip of database server>
    DB_USER: <database user>
    DB_PASSWORD: <password for user>
    DB_NAME: <database name>
    ```
