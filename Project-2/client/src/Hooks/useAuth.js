import { useRecoilState } from "recoil"
import { accessTokenAtom, userAtom } from "../state/userState.js"
import { handleLogin, handleLogout, loggedIn, newAccessToken, requestAccess } from "../utils/auth.js"
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';


export const useAuth = () => {
    const [user, setUser] = useRecoilState(userAtom)
    const [accessToken, setAccessToken] = useRecoilState(accessTokenAtom)

    const Login = async (username, password) => {
        try {
            const response = await handleLogin(username, password);
            const localTimeStamp = moment.utc(response.createdAt).add(5,'hours').add(30,'minutes').local().format("DD/MM/YYYY h:mm:ss")

            setUser({
                username: response.username, fullName: response.fullName, role: response.role, createdAt: localTimeStamp,
                isLoggedIn: response.isLoggedIn, activeSessions: response.activeSessions, isAuthenticated: true
            });

            setAccessToken(response.accessToken);

            return { status: true };
        }
        catch (err) {
            console.log("@Login : \n" + err);

            const errMsg = err.response.data.msg;

            return { status: false, msg: errMsg }
        }
    }

    const Logout = async (allDevices) => {
        try{
            const payload = {"username":user.username,"allDevices":allDevices}
            if(isTokenValid(accessToken)){
                await handleLogout(payload, accessToken)
            }
            else{
                const response = await rotateToken()
                await handleLogout(payload, response.newAccessToken)
            }

            return {status: true}
        }
        catch(err){
            console.log("@Logout : \n" + err);
            return {status: false}
        }
    }

    const isLoggedIn = async () => {
        try {
            const response = await loggedIn(user.username);

            return {isActive:response.isActive,activeSessions:response.activeSessions, role:response.role};
        }
        catch (err) {
            console.log("@isLoggedIn : \n" + err);
            return {isActive: false};
        }
    }

    const isTokenValid = () => {
        const decodedToken = jwtDecode(accessToken);
        return decodedToken.exp > (Date.now() / 1000);
    }

    const rotateToken = async () => {
        try {
            const response = await newAccessToken();
            
            return { status: true, newAccessToken: response.newAccessToken };
        }
        catch (err) {
            console.log("@rotateToken : \n" + err);

            return { status: false }
        }
    }

    const Request = async (payload) => {
        try{
            await requestAccess(accessToken, payload);

            return {status: true};
        }
        catch(err){
            console.log("@Request : \n"+err);
            return {status : false}
        }
    }

    return { Login, Logout, Request, isTokenValid, rotateToken, isLoggedIn };
}