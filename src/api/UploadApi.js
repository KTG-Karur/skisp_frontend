import { Navigate } from 'react-router-dom';
import { apiReturnCallBack } from './ApiConfig';
import apiContainer from './apiContainer';
const upload = apiContainer.upload;

//CREATE---->
export async function createUpload(request, id) {
    try {
        const response = await apiReturnCallBack('FORMPOST', upload + `/${id}`, request);
        const data = await response.json();
        if (!response.ok) {
            // Unauthorization
            if (data.code == 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
