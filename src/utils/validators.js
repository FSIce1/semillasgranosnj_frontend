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