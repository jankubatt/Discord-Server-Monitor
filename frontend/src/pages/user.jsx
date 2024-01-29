import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header, UserChart } from "../components";

const UserPage = () => {
    const {user} = useParams();
    const [userData, setUserData] = useState(null);
    const [userObject, setUserObject] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [selectedTimeSpan, setSelectedTimeSpan] = useState("day");
    const [milisecondsSpan, setMilisecondsSpan] = useState(86400000); // 24 hours in miliseconds
    const navigate = useNavigate();

    useEffect(() => {
        axios.post("http://localhost:8080/api/general/user/" + encodeURIComponent(user), {timespan: selectedTimeSpan}).then(data => setUserData(data.data))
    }, [selectedTimeSpan, user])

    useEffect(() => {
        switch (selectedTimeSpan) {
            case "hour":
                setMilisecondsSpan(3600000);
                break;
            case "day":
                setMilisecondsSpan(86400000);
                break;
            case "week":
                setMilisecondsSpan(604800000);
                break;
            case "month":
                setMilisecondsSpan(2592000000);
                break;
            case "year":
                setMilisecondsSpan(31536000000);
                break;
            default:
                setMilisecondsSpan(86400000);
                break;
        }
    }, [selectedTimeSpan])

    useEffect(() => {
        let obj = {}

        if (!userData || userData.length === 0) {
            obj.timeSpent = "0"
            obj.lastSeenTimestamp = "no data"
            obj.lastSeenStatus = "no data"
            setUserObject(obj)
            return;
        }

        userData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

        try {
            let overallUserTimeSpent = 0;

            if (userData.length === 0) {
                obj.timeSpent = 0;
                return
            };
            
            //Go through all the userData
            for (let i = 0; i < userData.length; i++) {
                //If the status isnt offline stop and start looking for offline status
                if (userData[i].status !== "offline") {
                    for (let j = i; j < userData.length; j++) {
                        //If next offline status found, calculate the time between those two statuses, add it to the overall time spent
                        if (userData[j].status === "offline") {
                            let time = new Date(userData[j].timestamp).getTime() - new Date(userData[i].timestamp).getTime();
                            overallUserTimeSpent += time;
                            i = j;  //Set the pointer to the current offline status
                            j = Infinity    //Make the for cycle not continue
                        }
                    }
                }
            }

            //If the last state isnt offline, that means the user is currently active, so calculate the time between the last status and now
            if (userData[userData.length-1].status !== "offline") {
                let time = new Date().getTime() - new Date(userData[userData.length-1].timestamp).getTime();
                overallUserTimeSpent += time;
            }

            const activeUser = userData.filter((item) => item.status === "online" || item.status === "dnd" || item.status === "idle");

            obj.timeSpent = parseFloat(overallUserTimeSpent/1000/60/60).toFixed(1)
            obj.lastSeenTimestamp = new Date(activeUser[activeUser.length - 1].timestamp).toLocaleString("cs")
            obj.lastSeenStatus = activeUser[activeUser.length - 1].status
        } catch {}

        setUserObject(obj)
    }, [userData, selectedTimeSpan])

    useEffect(() => {
        if (!userData || userData.length === 0) {
            setChartData([]);
            return;
        }
        
        let obj = [];

        userData.forEach((item) => {
            obj.push({username: item.username, status: item.status, timestamp: new Date(item.timestamp).getTime()})
        })

        let userStatuses = userData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

        obj.push({username: userData[0].username, status: userStatuses[userStatuses.length-1]?.status || "offline", timestamp: new Date().getTime()})
        obj.push({username: userData[0].username, status: "offline", timestamp: new Date().getTime()-milisecondsSpan})

        obj.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        setChartData(obj);
    }, [userData, milisecondsSpan])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                navigate(-1)
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [navigate]);

    if (userObject === null) return;

    return (
        <>
            <Header />
            <div className="exit-button" onClick={() => navigate(-1)}><div>⨉</div><p>ESC</p></div>

            <div className="container">
                <div className="user">
                    <div className="user-avatar">
                        {userData && <img src={userData[userData.length-1]?.avatar || userData[0]?.avatar} alt="avatar"></img>}
                        <select defaultValue={"day"} onChange={(e) => setSelectedTimeSpan(e.target.value)}>
                            <option value={"hour"}>1H</option>
                            <option value={"day"}>1D</option>
                            <option value={"week"}>1W</option>
                            <option value={"month"}>1M</option>
                            <option value={"year"}>1Y</option>
                        </select>
                    </div>
                    <div className="user-info" id="user-info-box">
                        <h2>{user}</h2>
                        <hr/>
                        <p>Total time: <span className='badge'>{userObject.timeSpent} h</span></p>
                        <p>Last seen: {userObject.lastSeenTimestamp} ({userObject.lastSeenStatus})</p>

                        {chartData.length !== 0 && <UserChart data={chartData} users={[user]} milisecondsSpan={milisecondsSpan}/>}
                    </div>
                </div>

            </div>
            
        </>
    )
}

export default UserPage;