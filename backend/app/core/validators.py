import re

def validate_cpf(cpf: str) -> bool:
    """Mathematical validation of Brazilian CPF."""
    cpf = re.sub(r'[^0-9]', '', cpf)
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return False

    for i in range(9, 11):
        value = sum((int(cpf[num]) * ((i + 1) - num) for num in range(0, i)))
        digit = ((value * 10) % 11) % 10
        if digit != int(cpf[i]):
            return False
    return True

def validate_cnpj(cnpj: str) -> bool:
    """Mathematical validation of Brazilian CNPJ."""
    cnpj = re.sub(r'[^0-9]', '', cnpj)
    if len(cnpj) != 14 or cnpj == cnpj[0] * 14:
        return False

    def calculate_digit(digits, weights):
        value = sum(int(digit) * weight for digit, weight in zip(digits, weights))
        remainder = value % 11
        return 0 if remainder < 2 else 11 - remainder

    weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

    digit1 = calculate_digit(cnpj[:12], weights1)
    digit2 = calculate_digit(cnpj[:13], weights2)

    return cnpj[-2:] == f"{digit1}{digit2}"

def validate_cpf_cnpj(value: str) -> bool:
    """Validate string as either a valid CPF or CNPJ."""
    clean_val = re.sub(r'[^0-9]', '', value)
    if len(clean_val) == 11:
        return validate_cpf(clean_val)
    if len(clean_val) == 14:
        return validate_cnpj(clean_val)
    return False
