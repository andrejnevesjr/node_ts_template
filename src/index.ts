import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

const server = app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

// const house = 1;

export { app, server };
