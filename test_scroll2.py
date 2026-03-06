from playwright.sync_api import sync_playwright

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_content("""
        <html>
        <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            .scrollbar-thin::-webkit-scrollbar {
                height: 8px;
            }
            .scrollbar-thin::-webkit-scrollbar-track {
                background: transparent;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb {
                background-color: #4b5563;
                border-radius: 4px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                background-color: #6b7280;
            }
        </style>
        </head>
        <body class="bg-slate-900 p-8">
            <div class="relative group/code mt-4 mb-4 rounded-xl overflow-hidden bg-[#1E1E1E] border border-gray-700/50 shadow-sm w-96">
                <!-- Apply scrollbar classes directly to the inner content that will scroll, or configure highlighter -->
                <div class="p-4 text-sm">
                    <pre class="scrollbar-thin" style="margin: 0px; padding: 0px; background: transparent; overflow-x: auto;">
                        <code class="language-sql" style="white-space: pre;">
SELECT
    DATE(data_pedido) AS data_do_pedido,
    COUNT(*) AS quantidade_pedidos,
    SUM(valor_total) AS valor_total_pedidos
FROM
    planintex.pedidos_venda
WHERE
    empresa_id = '899f1e7a-30c9-47cb-bf24-c1b3065a7401'
    AND data_pedido >= (SELECT DATE(MAX(data_pedido) - INTERVAL '21 days') FROM planintex.pedidos_venda)
GROUP BY
    DATE(data_pedido)
ORDER BY
    data_do_pedido DESC;
                        </code>
                    </pre>
                </div>
            </div>
        </body>
        </html>
        """)
        page.wait_for_timeout(1000)
        page.screenshot(path="test_scroll2.png")
        browser.close()

test()
