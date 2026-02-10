FROM node:22-bookworm AS webapp

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN find src/main/webapp -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.scss" -o -name "*.css" -o -name "*.html" \) -print0 | xargs -0 sed -i 's/\r$//'
RUN npm run webapp:prod

FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY . .
COPY --from=webapp /app/target/classes/static /app/target/classes/static

RUN chmod +x mvnw
RUN ./mvnw -ntp -DskipTests -Pprod -Dskip.npm -Dskip.installnodenpm package

FROM eclipse-temurin:17-jre-focal

WORKDIR /app
ENV JAVA_OPTS=""

COPY --from=build /app/target/*.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
