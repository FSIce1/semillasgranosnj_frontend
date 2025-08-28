export function validateNumber(event) {
    const key = event.key;

    if (
        !/^[0-9]$/.test(key) &&
        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)
    ) {
        event.preventDefault();
        return;
    }

    if (['Backspace', 'Delete'].includes(key)) {
        return;
    }
}

export function preventInvalidDecimal(event) {

    const key = event.key;
    const value = event.target.value;
    const selectionStart = event.target.selectionStart;
    const selectionEnd = event.target.selectionEnd;

    // Permitir sobrescribir el contenido seleccionado sin bloquear por largo de la cadena
    const isReplacing = selectionStart !== selectionEnd;

    // Permite solo números, un solo punto decimal, y teclas útiles como Retroceso, Suprimir, etc.
    if (!/^[0-9]$/.test(key) && key !== '.' && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
        event.preventDefault();
        return;
    }

    // Permitir borrar (Backspace, Delete) y escribir nuevamente en la parte entera
    if (['Backspace', 'Delete'].includes(key)) {
      return; // Permite borrar sin restricciones
    }

    // Asegura que solo se permita un punto decimal
    if (key === '.' && value.includes('.')) {
        event.preventDefault();
        return;
    }

    // Si estamos reemplazando texto, permite que se complete la sobrescritura
    if (isReplacing) {
        return;
    }

    // Limitar la parte entera a 8 dígitos si ya hay un punto decimal
    const [integerPart, decimalPart] = value.split('.');

    // Si no hay parte entera, permite seguir escribiendo (por si se borró todo)
    if (!integerPart && key !== '.') {
        return;
    }

    // Limitar la parte entera a 8 dígitos si ya hay un punto decimal o aún no se ha ingresado
    if (integerPart && integerPart.length >= 8 && key !== '.' && !value.includes('.')) {
        event.preventDefault();
        return;
    }

    // Limitar la parte decimal a 4 dígitos
    if (decimalPart && decimalPart.length >= 4 && value.includes('.')) {
        event.preventDefault();
    }

}