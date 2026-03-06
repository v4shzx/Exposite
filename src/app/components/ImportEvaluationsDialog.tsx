import { useState, useRef, useCallback } from 'react';
import { Upload, FileJson, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { EvaluacionesDB, MiembrosDB, type EvaluacionImportada } from '../lib/db';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    grupoId: number;
    onImported: () => void;
}

interface ParsedFile {
    fileName: string;
    data: EvaluacionImportada;
    matchedCount: number;
    unmatchedNames: string[];
}

export function ImportEvaluationsDialog({ isOpen, onClose, grupoId, onImported }: Props) {
    const [files, setFiles] = useState<ParsedFile[]>([]);
    const [imported, setImported] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const membersList = MiembrosDB.getByGrupo(grupoId);

    const processFiles = useCallback(
        (fileList: FileList) => {
            setError(null);
            const promises = Array.from(fileList).map(
                (file) =>
                    new Promise<ParsedFile | null>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            try {
                                const data = JSON.parse(reader.result as string) as EvaluacionImportada;
                                if (!data.evaluador || !Array.isArray(data.miembros)) {
                                    setError(`"${file.name}" no tiene el formato esperado.`);
                                    resolve(null);
                                    return;
                                }
                                // Match by idLista
                                const matched: number[] = [];
                                const unmatched: string[] = [];
                                for (const em of data.miembros) {
                                    const found = membersList.find((m) => m.idLista === em.idLista);
                                    if (found) matched.push(found.id);
                                    else unmatched.push(`#${em.idLista} ${em.nombre}`);
                                }
                                resolve({
                                    fileName: file.name,
                                    data,
                                    matchedCount: matched.length,
                                    unmatchedNames: unmatched,
                                });
                            } catch {
                                setError(`Error al leer "${file.name}". Verifica que sea JSON válido.`);
                                resolve(null);
                            }
                        };
                        reader.readAsText(file);
                    })
            );

            Promise.all(promises).then((results) => {
                const valid = results.filter(Boolean) as ParsedFile[];
                setFiles((prev) => {
                    // Deduplicate by evaluator name
                    const map = new Map<string, ParsedFile>();
                    for (const f of [...prev, ...valid]) map.set(f.data.evaluador, f);
                    return Array.from(map.values());
                });
            });
        },
        [membersList]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
        },
        [processFiles]
    );

    const handleImportAll = () => {
        for (const f of files) {
            EvaluacionesDB.importar(grupoId, f.data);
        }
        setImported(true);
        onImported();
    };

    const handleClose = () => {
        setFiles([]);
        setImported(false);
        setError(null);
        onClose();
    };

    const removeFile = (evaluador: string) => {
        setFiles((prev) => prev.filter((f) => f.data.evaluador !== evaluador));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Importar Evaluaciones</h2>
                    <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {imported ? (
                        <div className="text-center py-8 space-y-3">
                            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
                            <p className="text-lg font-bold text-gray-900">
                                ¡{files.length} evaluación{files.length > 1 ? 'es' : ''} importada{files.length > 1 ? 's' : ''}!
                            </p>
                            <p className="text-sm text-gray-500">Ahora puedes ver el podio consolidado.</p>
                        </div>
                    ) : (
                        <>
                            {/* Drop zone */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl p-8 text-center cursor-pointer transition-colors group"
                            >
                                <Upload className="w-10 h-10 text-gray-300 group-hover:text-indigo-400 mx-auto mb-3 transition-colors" />
                                <p className="text-sm font-medium text-gray-600">
                                    Arrastra archivos JSON aquí o <span className="text-indigo-600 underline">selecciona archivos</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Acepta múltiples archivos .json</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => e.target.files && processFiles(e.target.files)}
                                />
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded-lg p-3 text-sm">
                                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* File list */}
                            {files.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                        Archivos cargados ({files.length})
                                    </p>
                                    {files.map((f) => (
                                        <div
                                            key={f.data.evaluador}
                                            className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200"
                                        >
                                            <FileJson className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{f.data.evaluador}</p>
                                                <p className="text-xs text-gray-500">
                                                    {f.matchedCount} miembros coinciden
                                                    {f.unmatchedNames.length > 0 && (
                                                        <span className="text-amber-600 ml-1">
                                                            · {f.unmatchedNames.length} sin coincidencia
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeFile(f.data.evaluador)}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        {imported ? 'Cerrar' : 'Cancelar'}
                    </button>
                    {!imported && files.length > 0 && (
                        <button
                            onClick={handleImportAll}
                            className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-md"
                        >
                            Importar todo ({files.length})
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
