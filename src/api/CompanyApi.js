import { Navigate } from 'react-router-dom';
import { apiReturnCallBack } from './ApiConfig';
import apiContainer from './apiContainer';
const companyInfo = apiContainer.companyInfo;
//GET--->
export async function getCompanyInfo(request) {
    try {
        const response = await apiReturnCallBack('GET', companyInfo, request);
        const data = await response.json();
        if (!response.ok) {
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

//UPDATE---->
export async function updateCompanyInfo(request, companyInfoId) {
    try {
        const response = await apiReturnCallBack('PUT', companyInfo + `/${companyInfoId}`, request);
        const data = await response.json();
        if (!response.ok) {
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
