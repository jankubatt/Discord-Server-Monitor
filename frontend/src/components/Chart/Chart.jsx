import { useState } from "react";

const Chart = ({ data, users, milisecondsSpan }) => {
    const [tooltip, setTooltip] = useState(false);
    const [tooltipText, setTooltipText] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const screenWidth = window.innerWidth; // Get the screen width

    const calculateWidth = (startTime, endTime) => {
        const timeDiff = startTime - endTime;
        const maxWidth = screenWidth - 24; // Maximum width based on screen width
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
		if (e.clientX + 10 + 200 > screenWidth) {
			setTooltipPosition({ x: e.clientX - 150, y: e.clientY + 10 });
			return;
		}
		else {
			setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 });

		}
	};

	return (
		<>
			{users?.map((user) => {
				const userStatuses = data.filter((dataItem) => user.username === dataItem.username);
				return (
					<div key={user.username}>
						<div style={{position: "absolute", color: "white" }}>{user.username}</div>
						<div
							style={{
							display: "flex",
							flexDirection: "row",
							justifyContent: "flex-end",
							margin: "1px"
							}}
						>
							{userStatuses?.map((item, index) => {
								const startTime = item.timestamp;
								const endTime = index === 0 ? item.timestamp : userStatuses[index - 1].timestamp;

								const width = calculateWidth(startTime, endTime);

								return (
									<div
										key={item.timestamp}
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
				top: tooltipPosition.y,
				left: tooltipPosition.x,
				backgroundColor: "#fff",
				padding: "5px",
				border: "1px solid #ccc",
				borderRadius: "5px",
				boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
				color: "black"
				}}
			>
				{tooltipText && <p style={{margin: 0}}>{JSON.parse(tooltipText).username}<br/>{new Date(JSON.parse(tooltipText).startTime).toLocaleString("cs")}<br/>{new Date(JSON.parse(tooltipText).timestamp).toLocaleString("cs")}<br/>{JSON.parse(tooltipText).status}</p>}
			</div>
		</>
	);
};

export default Chart;
