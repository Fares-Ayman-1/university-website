import type { Relation } from "../relational";

/**
 * EMPLOYEE from Elmasri & Navathe's COMPANY database: the 8 tuples and the 7 attributes that
 * databases lecture 4 (04-relational-algebra.mdx) shows, with the page's Arabic headers.
 * The book's MINIT, BDATE and ADDRESS are left out because the page leaves them out.
 * SSNs are text (CHAR(9) in the book); James Borg has no supervisor (NULL).
 */
export const EMPLOYEE: Relation = {
  name: "EMPLOYEE",
  attributes: [
    { name: "FNAME", type: "string", label: { en: "First name", ar: "الاسم الأول" } },
    { name: "LNAME", type: "string", label: { en: "Last name", ar: "اسم العائلة" } },
    { name: "SSN", type: "string", label: { en: "Social security number", ar: "رقم الضمان الاجتماعي" } },
    { name: "SEX", type: "string", label: { en: "Sex", ar: "الجنس" } },
    { name: "SALARY", type: "number", label: { en: "Salary", ar: "الراتب" } },
    { name: "SUPERSSN", type: "string", label: { en: "Supervisor's SSN", ar: "رقم ضمان المشرف" } },
    { name: "DNO", type: "number", label: { en: "Department number", ar: "رقم القسم" } },
  ],
  rows: [
    { FNAME: "John", LNAME: "Smith", SSN: "123456789", SEX: "M", SALARY: 30000, SUPERSSN: "333445555", DNO: 5 },
    { FNAME: "Franklin", LNAME: "Wong", SSN: "333445555", SEX: "M", SALARY: 40000, SUPERSSN: "888665555", DNO: 5 },
    { FNAME: "Alicia", LNAME: "Zelaya", SSN: "999887777", SEX: "F", SALARY: 25000, SUPERSSN: "987654321", DNO: 4 },
    { FNAME: "Jennifer", LNAME: "Wallace", SSN: "987654321", SEX: "F", SALARY: 43000, SUPERSSN: "888665555", DNO: 4 },
    { FNAME: "Ramesh", LNAME: "Narayan", SSN: "666884444", SEX: "M", SALARY: 38000, SUPERSSN: "333445555", DNO: 5 },
    { FNAME: "Joyce", LNAME: "English", SSN: "453453453", SEX: "F", SALARY: 25000, SUPERSSN: "333445555", DNO: 5 },
    { FNAME: "Ahmad", LNAME: "Jabbar", SSN: "987987987", SEX: "M", SALARY: 25000, SUPERSSN: "987654321", DNO: 4 },
    { FNAME: "James", LNAME: "Borg", SSN: "888665555", SEX: "M", SALARY: 55000, SUPERSSN: null, DNO: 1 },
  ],
};
