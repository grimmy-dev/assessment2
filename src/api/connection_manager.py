import asyncio
from datetime import datetime
from typing import Dict
from fastapi import WebSocket

from .types import LogMessage


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.message_queues: Dict[str, list] = (
            {}
        )  # Store messages for connections not yet established
        self.connection_locks: Dict[str, asyncio.Lock] = {}

    async def connect(self, websocket: WebSocket, task_id: str):
        await websocket.accept()
        self.active_connections[task_id] = websocket

        # Send any queued messages
        if task_id in self.message_queues:
            for message in self.message_queues[task_id]:
                try:
                    await websocket.send_text(message)
                except Exception as e:
                    print(f"Error sending queued message: {e}")
            # Clear the queue after sending
            del self.message_queues[task_id]

    def disconnect(self, task_id: str):
        if task_id in self.active_connections:
            del self.active_connections[task_id]
        if task_id in self.message_queues:
            del self.message_queues[task_id]
        if task_id in self.connection_locks:
            del self.connection_locks[task_id]

    async def send_log(
        self,
        task_id: str,
        level: str,
        message: str,
        progress: int = 0,
        finished: bool = False,
    ):
        log = LogMessage(
            timestamp=datetime.now().strftime("%I:%M:%S %p"),
            level=level,
            message=message,
            progress=progress,
            finished=finished if finished else None,
        )

        log_json = log.model_dump_json()

        # If connection exists, send immediately
        if task_id in self.active_connections:
            try:
                await self.active_connections[task_id].send_text(log_json)
            except Exception as e:
                print(f"Error sending WebSocket message: {e}")
                self.disconnect(task_id)
        else:
            # Queue the message for when connection is established
            if task_id not in self.message_queues:
                self.message_queues[task_id] = []
            self.message_queues[task_id].append(log_json)

            # Limit queue size to prevent memory issues
            if len(self.message_queues[task_id]) > 100:
                self.message_queues[task_id] = self.message_queues[task_id][-50:]

    def get_connection_status(self, task_id: str) -> bool:
        return task_id in self.active_connections

    def get_queued_message_count(self, task_id: str) -> int:
        return len(self.message_queues.get(task_id, []))
