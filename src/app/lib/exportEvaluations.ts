/**
 * exportEvaluations.ts — Export current group evaluations as a JSON file.
 */
import { GruposDB, MiembrosDB, ReglasDB, type EvaluacionImportada } from './db';

export function buildEvaluationJSON(
    grupoId: number,
    username: string
): EvaluacionImportada {
    const grupo = GruposDB.getById(grupoId);
    const miembros = MiembrosDB.getByGrupo(grupoId);

    return {
        evaluador: username || 'Sin nombre',
        grupoNombre: grupo?.nombre ?? 'Grupo',
        exportedAt: new Date().toISOString(),
        miembros: miembros.map((m) => ({
            idLista: m.idLista,
            nombre: `${m.nombre} ${m.apPaterno} ${m.apMaterno}`.trim(),
            puntaje: m.puntaje ?? 0,
        })),
    };
}

export async function exportGroupJSON(
    grupoId: number,
    username: string
): Promise<void> {
    const data = buildEvaluationJSON(grupoId, username);
    const jsonString = JSON.stringify(data, null, 2);
    const fileName = `Evaluacion_${data.grupoNombre.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${data.evaluador.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    await performDownload(jsonString, fileName);
}

export async function exportMembersJSON(
    grupoId: number,
    grupoNombre: string
): Promise<void> {
    const miembros = MiembrosDB.getByGrupo(grupoId);
    const data = {
        tipo: 'miembros',
        grupoNombre,
        miembros: miembros.map((m) => ({
            idLista: m.idLista,
            nombre: m.nombre,
            apPaterno: m.apPaterno,
            apMaterno: m.apMaterno,
        })),
    };
    const jsonString = JSON.stringify(data, null, 2);
    const fileName = `Miembros_${grupoNombre.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    await performDownload(jsonString, fileName);
}

export async function exportRubricJSON(
    grupoId: number,
    grupoNombre: string
): Promise<void> {
    const reglas = ReglasDB.getByGrupo(grupoId);
    const data = {
        tipo: 'rubrica',
        grupoNombre,
        reglas: reglas.map((r) => ({
            titulo: r.titulo,
            descripcion: r.descripcion,
            puntaje: r.puntaje,
        })),
    };
    const jsonString = JSON.stringify(data, null, 2);
    const fileName = `Rubrica_${grupoNombre.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    await performDownload(jsonString, fileName);
}

async function performDownload(content: string, fileName: string): Promise<void> {
    const isDesktop = !!(window as any).__TAURI_INTERNALS__;

    if (isDesktop) {
        try {
            const { save } = await import('@tauri-apps/plugin-dialog');
            const { writeFile } = await import('@tauri-apps/plugin-fs');

            const path = await save({
                defaultPath: fileName,
                filters: [{ name: 'JSON', extensions: ['json'] }],
            });

            if (path) {
                const encoder = new TextEncoder();
                await writeFile(path, encoder.encode(content));
            }
        } catch (err) {
            console.error('Error saving JSON in desktop mode:', err);
            browserDownload(content, fileName);
        }
    } else {
        browserDownload(content, fileName);
    }
}

function browserDownload(content: string, fileName: string): void {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
