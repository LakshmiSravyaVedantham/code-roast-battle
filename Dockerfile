FROM node:20-slim
WORKDIR /app
COPY frontend/package*.json frontend/
RUN cd frontend && npm install
COPY frontend/ frontend/
RUN cd frontend && npm run build
COPY backend/package*.json backend/
RUN cd backend && npm install --production
COPY backend/ backend/
RUN cp -r frontend/dist backend/public
ENV PORT=7860
EXPOSE 7860
WORKDIR /app/backend
CMD ["node", "server.js"]
