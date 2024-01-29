import { useState } from "react";

const UserChart = ({ data, users, milisecondsSpan }) => {
    const [tooltip, setTooltip] = useState(false);
    const [tooltipText, setTooltipText] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const calculateWidth = (startTime, endTime) => {
        const timeDiff = startTime - endTime;
        const maxWidth = document.getElementById("user-info-box").offsetWidth - 32; // Maximum width based on screen width
        const percentage = (timeDiff / milisecondsSpan) * 100; // Convert time difference to percentage
        return (maxWidth * percentage) / 100; // Calculate width based on percentage
    };

    const handleMouseEnter = (e, text) => {
        setTooltip(true);
        setTooltipText(text);
        updateTooltipPosition(e);
    };

    const handleMouseMove = (e) => {
        updateTooltipPosition(e);
    };

    const handleMouseLeave = () => {
        setTooltip(false);
    };

    const updateTooltipPosition = (e) => {
        setTooltipPosition({ x: e.clientX, y: e.clientY });
    };

    return (
        <>
            {users?.map((user, index) => {
                const userStatuses = data;
            
                return (
                    <div key={user.username + index}>
                        <div style={{position: "absolute" }}>{user.username}</div>
                        <div
                            style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            }}
                        >
                            {userStatuses?.map((item, index) => {
                                const startTime = item.timestamp;
                                const endTime = index === 0 ? item.timestamp : userStatuses[index - 1].timestamp;

                                const width = calculateWidth(startTime, endTime);
                            
                                return (
                                    <div
                                    key={`${item.timestamp}${index}`}
                                    style={{
                                        backgroundColor:
                                        userStatuses[index-1]?.status === "offline"
                                            ? "grey"
                                            : userStatuses[index-1]?.status === "dnd"
                                            ? "red"
                                            : userStatuses[index-1]?.status === "idle"
                                            ? "orange"
                                            : "green",
                                        minWidth: `${width}px`,
                                        minHeight: "20px", // Set the height as per your requirement
                                    }}
                                    onMouseEnter={(e) => handleMouseEnter(e, JSON.stringify({...item, status: userStatuses[index-1]?.status, startTime: userStatuses[index-1]?.timestamp}))}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                    >
                                        <span style={{ display: "none" }}>{JSON.stringify({...item, startTime: userStatuses[index-1]?.timestamp})}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            <div
                style={{
                display: tooltip ? "block" : "none",
                position: "absolute",
                top: tooltipPosition.y + 10,
                left: tooltipPosition.x + 10,
                backgroundColor: "#fff",
                padding: "5px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
                color: "black"
                }}
            >
                {tooltipText && <p style={{margin: 0}}>{JSON.parse(tooltipText).username}<br/>{new Date(JSON.parse(tooltipText).startTime).toLocaleString("cs")} - {new Date(JSON.parse(tooltipText).timestamp).toLocaleString("cs")}<br/>{JSON.parse(tooltipText).status}</p>}
            </div>
        </>
    );
};

export default UserChart;
