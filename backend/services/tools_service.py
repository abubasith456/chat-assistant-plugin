from haystack.tools import Tool
from datetime import datetime
import pytz


class ToolsService:
    def __init__(self):
        self.current_client_timezone = "UTC"  # Default timezone
        self.tools = [
            Tool(
                name="current_datetime",
                description="Returns the current date and time in the client's timezone.",
                function=self._get_current_datetime,
                parameters={},
            ),
            # Add more tools here as needed
        ]

    def set_client_timezone(self, timezone: str):
        """Set the client's timezone for time-related operations"""
        self.current_client_timezone = timezone

    def add_tool(self, tool: Tool):
        """
        Adds a new tool to the service.

        :param tool: An instance of Tool to be added.
        """
        if not isinstance(tool, Tool):
            raise ValueError("The provided tool must be an instance of Tool.")
        self.tools.append(tool)

    def get_tools(self) -> list[Tool]:
        return self.tools

    def get_tools_metadata(self) -> list[dict]:
        return [
            {"name": tool.name, "description": tool.description} for tool in self.tools
        ]

    def _get_current_datetime(self):
        try:
            # Get current UTC time
            utc_now = datetime.now(pytz.UTC)
            
            # Convert to client's timezone
            if self.current_client_timezone != "UTC":
                try:
                    client_tz = pytz.timezone(self.current_client_timezone)
                    local_time = utc_now.astimezone(client_tz)
                    return f"{local_time.strftime('%Y-%m-%d %H:%M:%S %Z')} (Client timezone: {self.current_client_timezone})"
                except:
                    # Fallback to UTC if timezone is invalid
                    pass
            
            return f"{utc_now.strftime('%Y-%m-%d %H:%M:%S %Z')} (UTC)"
        except Exception as e:
            return f"Error getting time: {str(e)}"


tool_service = ToolsService()
