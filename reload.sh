 #!/bin/bash
# for localhost dev purposes
pnpm run build
sudo rm -r $HOME/homebrew/plugins/DeckyPlumber/
sudo rm -rf $HOME/homebrew/logs/DeckyPlumber/*
sudo cp -r ../DeckyPlumber/ $HOME/homebrew/plugins/
sudo systemctl restart plugin_loader.service