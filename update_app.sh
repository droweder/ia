#!/bin/bash
sed -i -e "s/import Files from '.\/pages\/Files';/import Files from '.\/pages\/Files';\nimport Projects from '.\/pages\/Projects';/g" src/App.tsx
sed -i -e "s/<Route path=\"files\" element={<Files \/>} \/>/<Route path=\"files\" element={<Files \/>} \/>\n                <Route path=\"projects\" element={<Projects \/>} \/>/g" src/App.tsx
