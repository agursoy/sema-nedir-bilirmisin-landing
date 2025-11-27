# ENTER FOLDER

cd video-src

# HOW TO EXTRACT FRAMES FROM VIDEO

ffmpeg -i video.mp4 -vf "fps=12,scale=720:-1" frame_%03d.jpg

# HOW TO CONVERT VIDEOS TO WEBP IMAGES

mkdir webp_output
for f in *.jpg; do cwebp -q 50 -m 6 "$f" -o "webp_output/${f%.*}.webp"; done

# REMOVE OLD FRAMES

rm -rf ../public/frames/*
cp webp_output/* ../public/frames/ 
