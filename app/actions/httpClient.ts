'use client';
import axios from 'axios';
import {CommonResponse, ListCompaniesResponse, ListFilesResponse} from '@/app/actions/http';

const objectToUrlParams = (obj: any) => {
  return new URLSearchParams(obj).toString();
};

const httpClient = (baseUrl: string, token?: string) => {
  const axiosClient = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${(token ?? typeof localStorage !== 'undefined') ? localStorage.getItem('token') : ''}`,
    },
  });
  axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response.status === 401) {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('token');
        }
        window.location.href = '/admin';
      }
      return Promise.reject(error);
    },
  );
  //auth/login

  const login = async (data: {
    email: string;
    password: string;
  }): Promise<
    CommonResponse<{
      token: string;
      expired_at: string;
    }>
  > => {
    return axiosClient
      .post('/auth/login', data)
      .then((response) => response.data);
  };
  const editFile = async (
    id: number,
    file: any | null,
    thumbnail: any | null,
    title: string,
    descriptions: string,
  ): Promise<CommonResponse<ListFilesResponse>> => {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (thumbnail) formData.append('thumbnail', thumbnail);
    formData.append('title', title);
    formData.append('descriptions', descriptions);
    return axiosClient
      .put(`/file/upload/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => response.data);
  };

  type editProps = {

    id?: number,
    name: any | null,
    logo_id: any | null,
    status: string,

  }


  const removeFile = async (id: number): Promise<CommonResponse<string>> => {
    return axiosClient
      .delete(`/file/upload/${id}`)
      .then((response) => response.data);
  };

  const uploadFile = async (
    file: any,
    thumbnail: any,
    title: string,
    descriptions: string,
  ): Promise<CommonResponse<ListFilesResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('thumbnail', thumbnail);
    formData.append('title', title);
    formData.append('descriptions', descriptions);
    return axiosClient
      .post('/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => response.data);
  };
  const listFiles = async (): Promise<CommonResponse<ListFilesResponse[]>> => {
    return axiosClient.get('/file/list').then((response) => response.data);
  };

  //NEW

  const generateToken = async (id: any) => {
    return axiosClient.patch(`/cmp/syncToken/${id}`, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }


  const fileUploader = async (file: any) => {
    const data = new FormData()
    data.append("file", file)
    return axiosClient.post('/file/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
        .then((response) => response.data)
  }

  const createCompany = async (body: editProps) => {
    return axiosClient
        .post(`/cmp/create`, body, {
          headers: {
            'Content-Type': 'application/json'
          },
        })
        .then((response) => response.data);
  };

  const editCompany = async (body: editProps) => {
    return axiosClient
        .put(`/cmp/update/${body.id}`, body, {
          headers: {
            'Content-Type': 'application/json'
          },
        })
        .then((response) => response.data);
  };

  const removeCompany = async (id: number): Promise<CommonResponse<string>> => {
    return axiosClient
        .delete(`/cmp/delete/${id}`)
        .then((response) => response.data);
  };

  const listCompanies = async ({limit, page}: {
    limit: number,
    page: number
  }): Promise<CommonResponse<ListCompaniesResponse[]>> => {
    const urlParams: string = objectToUrlParams({limit, page});
    return axiosClient.get(`/cmp/list?${urlParams}`).then((response) => response.data);
  };

  return {
    uploadFile,
    listFiles,
    login,
    removeFile,
    editFile,
    listCompanies,
    removeCompany,
    editCompany,
    fileUploader,
    createCompany,
    generateToken
  };
};

export default httpClient;
