# Flujo de Trabajo con Git y GitHub
Este documento describe los pasos básicos para trabajar con ramas en GitHub, mantener tu rama actualizada, subir tus cambios y fusionarlos con `main`.
---
## 1. Moverse a tu rama
Primero asegúrate de estar en tu rama de trabajo:
```bash
git checkout nombre-de-tu-rama
```
Verifica en que rama estás:
```bash
git branch
```
## 2. Actualizar tu rama con los cambios más recientes
Antes de empezar a trabajar, descarga los cambios del repositorio remoto y actualiza tu rama con respecto a `main`
```bash
git pull origin main
```
## 3. Hacer cambios y preparar el commit
Luego de editar tus archivos, añade los cambios al área de staging:
```bash
git add .
```
Crea un commit con un mensaje descriptivo:
```bash
git commit -m "Descripción breve de los cambios realizados"
```
En caso de no poder realizar el commit por ser la primera vez, ejecutar los siguientes códigos y volver a intentar el punto `3`
```bash
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
```  
- Reemplazar `you@example.com` y `Your Name` por tu correo y nombre respectivamente.
## 4. Subir tus cambios a tu rama en GitHub
Envía tus cambios al repositorio remoto:
```bash
git push origin nombre-de-tu-rama
```
## 5. Fusionar tu rama con main
### Cuando hayas terminado tus cambios y todo funcione correctamente:
Muévete a la rama main:
```bash
git checkout main
```
Actualiza `main` si no lo está:
```bash
git pull origin main
```
Fusiona tu rama con `main`:
```bash
git merge nombre-de-tu-rama
```
Sube la rama `main` actualizada al remoto:
```bash
git push origin main
```