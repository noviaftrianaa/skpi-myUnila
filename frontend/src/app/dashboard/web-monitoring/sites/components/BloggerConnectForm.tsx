
"use client";

import React, { useState } from "react";
import { Input, Button, Card, CardBody } from "@heroui/react";
import { FiLink, FiCheck, FiLoader } from "react-icons/fi";

export default function BloggerConnectForm() {
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [detectedId, setDetectedId] = useState<string | null>(null);

    const handleDetect = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setDetectedId("8912739812739812");
        }, 1500);
    };

    return (
        <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-none rounded-lg">
            <CardBody className="gap-3 p-4">
                <h4 className="font-semibold text-sm">Connect Blogger</h4>
                <div className="flex gap-2">
                    <Input
                        placeholder="https://example.blogspot.com"
                        value={url}
                        onValueChange={setUrl}
                        startContent={<FiLink className="text-gray-400" />}
                        size="sm"
                        className="flex-1"
                    />
                    <Button
                        color="primary"
                        size="sm"
                        isLoading={isLoading}
                        onPress={handleDetect}
                        isDisabled={!url}
                    >
                        Detect
                    </Button>
                </div>
                {detectedId && (
                    <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-2 rounded">
                        <FiCheck />
                        <span>Blog ID: {detectedId}</span>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
