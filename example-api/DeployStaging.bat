call gcloud config set project jungle-freaks
call docker system prune --force
call docker build --build-arg target_env=staging --tag=gcr.io/jungle-freaks/jfmc-staging-api .
call docker push gcr.io/jungle-freaks/jfmc-staging-api
call gcloud beta run deploy jfmc-staging-api --image gcr.io/jungle-freaks/jfmc-staging-api --allow-unauthenticated --region us-central1 --vpc-connector web3-api-connector --update-secrets=SIGNER_PRIVATE_KEY=api-signer-private-key:latest
