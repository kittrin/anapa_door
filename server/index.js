import axios from "axios";

class OpenDoorController{
    static async getOpen(){
        return await axios({
            method: 'get',
            url: `http://admin:admin@10.10.1.224/protect/rb0s.cgi`,
            // headers: {
            //     'Authorization': 'admin:admin'
            // }
        }).then((response) => {
            return response.data
        })
    }
}
const data = async ()=>{
    try {
         await OpenDoorController.getOpen()
    } catch (e){
        console.log(e)
    } finally {

    }
}
await data();
console.log(data())