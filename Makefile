PHONY: github aws-assets aws-htmljs aws-cache live copy-data

copy-data:
	cp ~/Pudding/helpers/top-plays/output/web.csv ./src/assets/data
	rm -rf ./src/assets/video
	cp -rf ~/Pudding/helpers/top-plays/output/video-web ./src/assets
	mv ./src/assets/video-web ./src/assets/video

github:
	rm -rf docs
	cp -r dist/ docs
	git add -A
	git commit -m "update dev version"
	git push

archive:
	zip -r archive.zip dev

# aws-assets:
# 	aws s3 sync dist s3://pudding.cool/year/month/name --delete --cache-control 'max-age=31536000' --exclude 'index.html' --exclude 'bundle.js'

# aws-htmljs:
# 	aws s3 cp dist/index.html s3://pudding.cool/year/month/name/index.html
# 	aws s3 cp dist/bundle.js s3://pudding.cool/year/month/name/bundle.js

# aws-cache:
# 	aws cloudfront create-invalidation --distribution-id E13X38CRR4E04D --paths '/year/month/name*'	

# live: aws-assets aws-htmljs aws-cache archive
