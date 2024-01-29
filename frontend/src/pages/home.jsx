import { useEffect, useState } from 'react';
import axios from "axios";
import '../App.css'
import { Header, Chart } from '../components';

const HomePage = () => {
    const [data, setData] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [selectedTimeSpan, setSelectedTimeSpan] = useState("day");
    const [milisecondsSpan, setMilisecondsSpan] = useState(86400000);

    const fetchData = async () => {
        const response = await axios.post(`http://localhost:8080/api/general/`, {timespan: selectedTimeSpan});
        return response.data;
    }

    const fetchUsers = async () => {
        const response = await axios.get(`http://localhost:8080/api/general/users`);
        return response.data;
    }

    const fetchStats = async () => {
        const response = await axios.post(`http://localhost:8080/api/general/stats`, {timespan: selectedTimeSpan});
        return response.data;
    }

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
        fetchUsers().then(response => {
            let result = []
            
            response.forEach((user) => {
                console.log(user)
                let userData = data.filter((item) => user.username === item.username).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                let overallUserTimeSpent = 0;

                if (userData.length === 0) {
                    result.push({...user, timeOverall: 0})
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

                result.push({...user, timeOverall: parseFloat(overallUserTimeSpent/1000/60/60).toFixed(1)})
            })

            result.sort((a, b) => b.timeOverall - a.timeOverall)
            setUsers(result);
        })
    }, [data])

    useEffect(() => {
        let obj = [];

        data.forEach((item) => {
            obj.push({username: item.username, status: item.status, timestamp: new Date(item.timestamp).getTime()})
        })

        users.forEach((user) => {
            let userStatuses = data.filter((item) => user.username === item.username).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            obj.push({username: user.username, status: userStatuses[userStatuses.length-1]?.status || "offline", timestamp: new Date().getTime()})
            obj.push({username: user.username, status: "offline", timestamp: new Date().getTime()-milisecondsSpan})
        })

        obj.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        setChartData(obj);
    }, [users])

    useEffect(() => {
        fetchData().then(response => setData(response))
        fetchStats().then(response => setStats(response))
    }, [selectedTimeSpan])

    useEffect(() => {
        fetchData().then(response => setData(response))
        fetchStats().then(response => setStats(response))
    }, [])

    return (
        <div className='main'>
            <Header />
            <select defaultValue={"day"} onChange={(e) => setSelectedTimeSpan(e.target.value)}>
                <option value={"hour"}>1H</option>
                <option value={"day"}>1D</option>
                <option value={"week"}>1W</option>
                <option value={"month"}>1M</option>
                <option value={"year"}>1Y</option>
            </select>
            
            {chartData.length != 0 && <Chart data={chartData} users={users} milisecondsSpan={milisecondsSpan}/>}

            

            <div className='card'>
                <h2>Users ({users.length})</h2>

                <div className='card-body'>
                    <div className='users-list'>
                        {users.map((user) => {
                            console.log(user)
                            return (<a className='users-list-box' href={`/u/${encodeURIComponent(user.username)}`} key={user.username + "list"}>
                                        <img className='users-list-avatar' src={user.avatar} alt="avatar"></img>
                                        <div className='users-list-status-background'>
                                            <div className='users-list-status' style={{
                                                backgroundColor: user.status === "online" ? "green" : user.status === "idle" ? "orange" : user.status === "dnd" ? "red" : "grey"
                                            }}></div>
                                        </div>
                                        
                                        <p>{user.username} <span className='badge'>{user.timeOverall} h</span></p> 
                                    </a>)
                        })}
                    </div>
                </div>
            </div>

            <div className='stats'>
                <p>
                    Number of records: {stats?.records}<br/>
                    Size of DB: {stats?.size} MB
                </p>
            </div>
        </div>
    )
}

export default HomePage;
