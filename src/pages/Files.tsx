import React from 'react';
import { FileText, MoreHorizontal, Download, Trash2, Search } from 'lucide-react';

const Files: React.FC = () => {
  // Mock data for files
  const files = [
    { id: 1, name: 'Relatório_Vendas_Q3.pdf', type: 'PDF', size: '2.4 MB', date: '2023-10-24' },
    { id: 2, name: 'Contrato_Fornecedor_ABC.docx', type: 'DOCX', size: '1.1 MB', date: '2023-10-22' },
    { id: 3, name: 'Planilha_Orçamento_2024.xlsx', type: 'XLSX', size: '4.8 MB', date: '2023-10-20' },
    { id: 4, name: 'Apresentação_Institucional.pptx', type: 'PPTX', size: '12.5 MB', date: '2023-10-18' },
    { id: 5, name: 'Notas_Reunião_Diretoria.txt', type: 'TXT', size: '15 KB', date: '2023-10-15' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Arquivos e Documentos</h1>
           <p className="text-sm text-gray-500 mt-1">Gerencie os arquivos utilizados nas suas conversas com a IA.</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            Enviar arquivo
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar arquivos..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
            </div>
            <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none">
                <option>Todos os tipos</option>
                <option>PDFs</option>
                <option>Documentos</option>
                <option>Planilhas</option>
            </select>
        </div>

        {/* Files Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-medium border-b border-gray-100 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-4 w-12">
                            <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                        </th>
                        <th className="px-6 py-4">Nome</th>
                        <th className="px-6 py-4">Tipo</th>
                        <th className="px-6 py-4">Tamanho</th>
                        <th className="px-6 py-4">Data de Envio</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {files.map((file) => (
                        <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                            <td className="px-6 py-4">
                                <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        <FileText size={16} />
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">{file.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500">{file.type}</td>
                            <td className="px-6 py-4 text-gray-500">{file.size}</td>
                            <td className="px-6 py-4 text-gray-500">{file.date}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors" title="Baixar">
                                        <Download size={16} />
                                    </button>
                                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Excluir">
                                        <Trash2 size={16} />
                                    </button>
                                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Files;
