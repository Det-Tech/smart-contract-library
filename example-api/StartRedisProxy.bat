call gcloud config set project jungle-freaks
gcloud compute ssh redis-proxy --zone=us-central1-a -- -N -L 6379:10.36.134.251:6379
