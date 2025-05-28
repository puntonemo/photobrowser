export const handleSubmit = async (
    firstname: string,
    lastname: string,
    email: string,
    challenge?: string,
    pinCode?: string,
    language?: string,
) => {
    try {
        const body = { firstname, lastname, email, challenge, pinCode, language };
        console.log(body);
        const optionsRes = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (optionsRes.ok) {
            const options = await optionsRes.json();
            if (options.challenge) return { challenge: options.challenge };
            if (options.result) return { result: options.result };
        }
        return { result: 'error' };
    } catch (error) {
        return { result: 'error' };
    }
};
