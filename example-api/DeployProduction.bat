call gcloud config set project jungle-freaks
call docker system prune --force
call docker build --build-arg target_env=production --tag=gcr.io/jungle-freaks/jfmc-api .
call docker push gcr.io/jungle-freaks/jfmc-api
call gcloud beta run deploy jfmc-api --image gcr.io/jungle-freaks/jfmc-api --allow-unauthenticated --region us-central1 --vpc-connector web3-api-connector --update-secrets=SIGNER_PRIVATE_KEY=api-signer-private-key:latest
