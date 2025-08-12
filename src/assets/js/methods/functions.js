
import axios from "axios"

export function signIn(url, data){

    return new Promise((resolve, reject)=>{

        axios.post(url, data, {
            withCredentials: false
        }).then(response => {
            resolve(response);
        }).catch(error => {
            handleErrors(error, reject);
        });

    });

}

export function list(url, filters){

    return new Promise((resolve, reject)=>{

        axios.post(url, filters).then(data => {
            resolve(data);
        }).catch(function (error) {
            let errors = error?.response?.data?.errors?.server;
            reject(errors);
        });

    });

}

export function save(url, data, id) {

    return new Promise((resolve, reject) => {

        try {

            if (!id) {

                axios.post(url, data).then(response => {
                    resolve(response);
                }).catch(error => {
                    handleErrors(error, reject);
                });

            } else {
                
                data.append('_method', 'PUT');
                axios.post(`${url}/${id}`, data).then(response => {
                    resolve(response);
                }).catch(error => {
                    handleErrors(error, reject);
                });

            }

        } catch (error) {
            reject('Error desconocido en el servidor');
        }

    });

}

export function get(url) {

    return new Promise((resolve, reject) => {
                    
        try {

            axios.get(url).then(response => {
                resolve(response);
            }).catch(error => {
                handleErrors(error, reject);
            });

        } catch (error) {
            reject('Error desconocido en el servidor');
        }

    });

}

export function show(url){

    return new Promise((resolve, reject)=>{

        axios.post(url).then(data => {
            resolve(data);
        }).catch(function (error) {
            let errors = error?.response?.data?.errors?.server;
            reject(errors);
        });

    });

}

export function destroy(url){

    return new Promise((resolve, reject)=>{

        axios.delete(url).then(data => {
            resolve(data);
        }).catch(function (error) {
            let errors = error?.response?.data?.errors?.server;
            reject(errors);
        });

    });

}

export function report(url, filters, name = "reporte.xlsx"){
    return new Promise((resolve, reject) => {

        axios.post(url, filters, {
            responseType: 'blob',
            withCredentials: false
        }).then(response => {
            
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');

            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            resolve('Descarga completada');

        }).catch(error => {
            handleErrors(error, reject);
        });

    });
}

export function ticket(url, filters){
    return new Promise((resolve, reject) => {

        axios.post(url, filters, {
            responseType: 'blob',
            withCredentials: false
        }).then(response => {

            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const urlBlob = window.URL.createObjectURL(blob);

            const printWindow = window.open(urlBlob, '_blank');

            printWindow.onload = () => {
                printWindow.print();
            };

            resolve('Ticket enviado a impresión');

        }).catch(error => {
            handleErrors(error, reject);
        });

    });
}

export function getRolePermission(url, id){

    return new Promise((resolve, reject)=>{

        let data = new FormData();
        data.append('id', id);

        axios.post(url, data).then(data => {
            resolve(data);
        }).catch(function (error) {
            let errors = error?.response?.data?.errors?.server;
            reject(errors);
        });

    });

}

//? Auxiliaries
function handleErrors(error, reject) {

    const validationErrors = error?.response?.data?.errors?.server || 
                            error?.response?.data?.message || 
                            'Error desconocido en el servidor';

    let errorMessages = [];
    if (Array.isArray(validationErrors)) {
        errorMessages = validationErrors;
    } else if (typeof validationErrors === 'object') {
        Object.keys(validationErrors).forEach(key => {
            errorMessages.push(...validationErrors[key]);
        });
    } else {
        errorMessages.push(validationErrors);
    }

    reject(errorMessages);

}