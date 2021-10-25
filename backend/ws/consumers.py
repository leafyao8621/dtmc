import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.dispatch.dispatcher import receiver

import threading
import numpy

import dtmc

class CalculatorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        s0 = text_data_json["s0"]
        t = text_data_json["t"]
        iter = text_data_json["iter"]
        hist = text_data_json["hist"]
        result = {"result": None}
        success = True
        def func():
            result["result"] = dtmc.calculate(
                numpy.array(s0, dtype=numpy.double),
                numpy.array(t, dtype=numpy.double),
                iter,
                hist
            )
        try:
            thread = threading.Thread(target=func)
            thread.start()
            thread.join()
        except:
            success = False
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "result": result["result"].tolist() if success else None,
                "success": success
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        result = event["result"]
        success = event["success"]

        # Send message to WebSocket
        await self.send(
            text_data=json.dumps({
                "result": result,
                "success": success
            })
        )
