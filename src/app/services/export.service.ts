import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }


  exportarUsuariosExcel(pacientes: any[], especialistas: any[], admins: any[], disponiblidades: any[]) {
    // Convierte los datos de los pacientes a una hoja de trabajo (worksheet)
    const wsPacientes: XLSX.WorkSheet = XLSX.utils.json_to_sheet(pacientes);
    // Convierte los datos de los administradores a una hoja de trabajo (worksheet)
    const wsAdmins: XLSX.WorkSheet = XLSX.utils.json_to_sheet(admins);
    // Convierte los datos de los especialistas a una segunda hoja (worksheet)
    const wsEspecialistas: XLSX.WorkSheet = XLSX.utils.json_to_sheet(especialistas);
    // Convierte los datos de disponibilidades a una hoja de trabajo (worksheet)
    const wsDisponibilidades_especialistas: XLSX.WorkSheet = XLSX.utils.json_to_sheet(disponiblidades);

    // 3. Crea un libro de trabajo con las dos hojas
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    
    // Agregar las dos hojas al libro de trabajo
    XLSX.utils.book_append_sheet(wb, wsPacientes, 'Pacientes');
    XLSX.utils.book_append_sheet(wb, wsAdmins, 'Administradores');
    XLSX.utils.book_append_sheet(wb, wsEspecialistas, 'Especialistas');
    XLSX.utils.book_append_sheet(wb, wsDisponibilidades_especialistas, 'Disponibilidad Especialistas');

    // 4. Genera un archivo Excel y lo descarga
    XLSX.writeFile(wb, 'datos_usuarios.xlsx');
  }

  exportarUsuarioExcel(datos: any) {
    const datosEstaticosTurnoPaciente = datos.map((dato: any) => ({
        Paciente: dato.paciente,
        Especialista: dato.especialista,
        Especialidad: dato.especialidad,
        Día: dato.dia,
        Hora: dato.hora,
        Comentario: dato.comentario
    }));

    const datosEstaticosHistoriaClinicaPaciente = datos.map((dato: any) => ({
        Día: dato.dia,
        Hora: dato.historiaClinica.hora,
        Altura: dato.historiaClinica.altura,
        Peso: dato.historiaClinica.peso,
        Temperatura: dato.historiaClinica.temperatura,
        Presión: dato.historiaClinica.presion
    }));

    const datosDinamicosHistoriaClinicaPaciente = datos.flatMap((dato: any) => {
        if (dato.historiaClinica.datosDinamicos) {
            return dato.historiaClinica.datosDinamicos.map((dinamico: any) => ({
                Día: dato.dia,
                Hora: dato.hora,
                Clave: dinamico.clave,
                Valor: dinamico.valor
            }));
        } else {
            return [];
        }
    });

    const wsTurnosPaciente: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosEstaticosTurnoPaciente);
    const wsHistoriaClinicaPaciente: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosEstaticosHistoriaClinicaPaciente);
    const wsDatosDinamicosHistoriaClinicaPaciente: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosDinamicosHistoriaClinicaPaciente);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsTurnosPaciente, 'Turnos');
    XLSX.utils.book_append_sheet(wb, wsHistoriaClinicaPaciente, 'Historia Clínica');
    XLSX.utils.book_append_sheet(wb, wsDatosDinamicosHistoriaClinicaPaciente, 'Datos Dinámicos');

    XLSX.writeFile(wb, `datos_usuario_${datos[0].paciente}.xlsx`);


  }

  exportarHistoriasClinicasPDF(datos: any[], nombreUsuario: string, rol: String) {
    // Código para exportar historia clínica a PDF

    // 1. Crear un objeto de documento PDF
    const doc = new jsPDF();

    // 2. Cargar la imagen y convertirla a base64
    const img = new Image();
    img.src = 'icon_hospital.png'; // Reemplaza con la ruta de tu imagen local
    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0);
        }
        const imgData = canvas.toDataURL('image/png');

        // 3. Agregar la imagen al PDF
        const pageWidth = doc.internal.pageSize.getWidth();
        const imgWidth = 50; // Ancho de la imagen
        const xImg = (pageWidth - imgWidth) / 2;
        doc.addImage(imgData, 'PNG', xImg, 10, imgWidth, 50);

        // 4. Agregar el título "Historia clínica"
        const title = `Historia clínica de ${nombreUsuario}`;
        const titleWidth = doc.getTextWidth(title);
        const xTitle = (pageWidth - titleWidth) / 2;
        doc.setFontSize(18);
        doc.text(title, xTitle, 70);

        // 5. Agregar el subtítulo con la fecha de emisión
        const fechaEmision = new Date().toLocaleDateString();
        doc.setFontSize(12);
        doc.text(`Fecha de emisión: ${fechaEmision}`, 14, 80);

        const nombreColumna = rol === 'paciente' ? 'Especialista' : 'Paciente';

        // 6. Crear una tabla con los datos estáticos de las historias clínicas
        const headEstatica = [[nombreColumna, 'Especialidad', 'Día', 'Hora', 'Altura', 'Peso', 'Temperatura', 'Presión']];
        const bodyEstatica = datos.map(dato => [
            dato.especialista,
            dato.especialidad,
            dato.dia,
            dato.hora,
            dato.altura,
            dato.peso,
            dato.temperatura,
            dato.presion
        ]);

        autoTable(doc, {
            startY: 90,
            head: headEstatica,
            body: bodyEstatica,
        });

        // 7. Crear una tabla con los datos dinámicos de las historias clínicas
        const headDinamica = [['Día', 'Hora', 'Clave', 'Valor']];
        const bodyDinamica = datos.flatMap(dato => {
            if (dato.datosDinamicos) {
                return dato.datosDinamicos.map((dinamico: any) => [
                    dato.dia,
                    dato.hora,
                    dinamico.clave,
                    dinamico.valor
                ]);
            } else {
                return [];
            }
        });

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 10, // Espacio entre las dos tablas
            head: headDinamica,
            body: bodyDinamica,
        });

        // 8. Guardar el documento PDF con el nombre del paciente
        doc.save(`historia_clinica_${nombreUsuario}.pdf`);
    };
}
}
